import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import UserAccount from '@/models/UserAccount';
import PsychometricResult from '@/models/PsychometricResult';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader } from '@/lib/auth';
import { evaluateMcqResponse } from '@/evaluation/pri-test-mcq';
import { evaluateWrittenResponse, mergeEvaluationResults } from '@/evaluation/pri-test-written';

function buildPriPercentage(mcqPriScore: number, writtenPriScore: number, decimals = 2): number {
  const safeMcq = Number.isFinite(mcqPriScore) ? mcqPriScore : 0;
  const safeWritten = Number.isFinite(writtenPriScore) ? writtenPriScore : 0;
  const cappedRaw = Math.min(100, Math.max(0, safeMcq + safeWritten));
  let percentage = Number(cappedRaw.toFixed(decimals));

  // Guard: if MCQ has non-zero marks, PRI should not collapse to 0 due to rounding.
  if (percentage === 0 && safeMcq > 0) {
    const minStep = Number((1 / Math.pow(10, decimals)).toFixed(decimals));
    percentage = minStep;
  }

  return percentage;
}

/**
 * POST /api/admin/pri-tests/:id/evaluate
 * Admin: Generate (or regenerate) PRI scores for all submitted responses for a test.
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization') || '';
  const admin = getAdminFromAuthHeader(authHeader);
  const institutionAdmin = !admin ? getInstitutionAdminFromAuthHeader(authHeader) : null;
  if (!admin && !institutionAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await connectDB();

    const bankId = new mongoose.Types.ObjectId(id);

    const testBank = await PriTestBank.findById(bankId).lean();
    if (!testBank) {
      return NextResponse.json({ error: 'PRI test bank not found' }, { status: 404 });
    }

    const questions = testBank.questions ?? [];

    // Filter: institution admins only see their own institution's responses
    const responseFilter: Record<string, unknown> = {
      questionBankId: bankId,
      status: 'submitted',
    };
    if (institutionAdmin) {
      responseFilter.institutionId = new mongoose.Types.ObjectId(institutionAdmin.institutionId);
    }

    // Fetch all submitted responses for this test
    const responses = await PriTestResponse.find(responseFilter).lean();

    if (responses.length === 0) {
      return NextResponse.json({ evaluated: 0, message: 'No submitted responses found for this test.' }, { status: 200 });
    }

    const insightsBaseUrl = process.env.INSIGHTS_SERVICE_URL || process.env.STUDENT_INSIGHTS_SERVICE_URL;
    const normalizedInsightsBaseUrl = insightsBaseUrl?.replace(/\/+$/, '') ?? '';

    let evaluated = 0;
    let totalScoreSum = 0;

    for (const response of responses) {
      // ── MCQ Scoring via shared utility ──────────────────────────────────────
      // evaluateMcqResponse trusts the pre-computed isCorrect field when available,
      // falling back to correctAnswer comparison from the bank otherwise.
      const mcqResult = evaluateMcqResponse(testBank as any, response as any);
      const mcqCorrect = mcqResult.mcqCorrect;
      const mcqTotal = mcqResult.mcqTotal;

      // ── Written Task Scoring via AI evaluation ──────────────────────────────
      const writtenResult = evaluateWrittenResponse(testBank as any, response as any);

      // ── Psychometric Evaluation (Workspace Psychology) ──
      const psychDomain = testBank.domains?.find(d => d.domainId === 'workspace-psychology');
      let psychOverallStatus: 'pass' | 'fail' | 'pending' = 'pending';
      let psychTraitResults: Record<string, { score: number; maxScore: number; passed: boolean }> = {};

      if (psychDomain) {
        const psychScores: Record<string, number> = {};
        let passedTraitsCount = 0;

        // Group questions by subskill for easier trait-level calculation
        const psychQuestions = questions.filter(q => q.domainId === 'workspace-psychology');
        const questionsByTrait = new Map<string, typeof psychQuestions>();
        psychQuestions.forEach(q => {
          const list = questionsByTrait.get(q.subSkill) || [];
          list.push(q);
          questionsByTrait.set(q.subSkill, list);
        });

        // Initialize scores for all configured traits
        psychDomain.subskills.forEach(sub => {
          psychScores[sub.name] = 0;
        });

        // Calculate actual scores based on student answers
        for (const answer of response.answers ?? []) {
          const question = questions[answer.questionIndex];
          if (!question || question.domainId !== 'workspace-psychology') continue;

          const selectedLabel = answer.selectedOption;
          const option = question.options?.find(o => o.label === selectedLabel);
          const score = option?.score ?? -1.0; // Default to -1.0 for skipped/not-found as per policy

          psychScores[question.subSkill] = (psychScores[question.subSkill] || 0) + score;
        }

        // Finalise trait results and determine if passed
        for (const sub of psychDomain.subskills) {
          const traitScore = psychScores[sub.name] || 0;
          const traitQuestions = questionsByTrait.get(sub.name) || [];
          const maxTraitScore = traitQuestions.length * 1.0;
          const traitPassed = traitScore >= (maxTraitScore / 2);

          if (traitPassed) passedTraitsCount++;

          psychTraitResults[sub.name] = {
            score: traitScore,
            maxScore: maxTraitScore,
            passed: traitPassed
          };
        }

        psychOverallStatus = passedTraitsCount >= 3 ? 'pass' : 'fail';
        const aiAnalysis = psychOverallStatus === 'pass' 
          ? 'Evaluation complete. Student has successfully cleared the behavioral gateway.' 
          : 'Evaluation complete. Behavioral profile has been recorded.';

        // Persist to psychometric_results
        await PsychometricResult.findOneAndUpdate(
          {
            studentUserId: response.studentUserId,
            institutionId: response.institutionId,
            questionBankId: bankId,
          },
          {
            $set: {
              studentId: response.studentId,
              studentName: response.studentName,
              studentUsername: response.studentUsername,
              scores: psychScores,
              traitResults: psychTraitResults,
              overallStatus: psychOverallStatus,
              passedTraitsCount,
              aiAnalysis,
              status: 'submitted',
              submittedAt: response.submittedAt || new Date(),
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
      } else {
        // If no psychometric domain, assume pass for PRI evaluation visibility
        psychOverallStatus = 'pass';
      }

      // ── Merge MCQ + Written domain results ──────────────────────────────────
      const mcqDomainResults = mcqResult.domains.map((d) => ({
        domainId: d.domainId,
        domainName: d.domainName,
        domainShare: d.domainShare,
        answered: d.answered,
        correct: d.correct,
        total: d.total,
        score: d.score,
        subskills: d.subskills.map((s) => ({
          name: s.name,
          share: s.share,
          priContribution: s.priContribution,
          answered: s.answered,
          correct: s.correct,
          total: s.total,
          score: s.score,
        })),
      }));

      // Merge written task scores into domain results
      const domainResults = mergeEvaluationResults(mcqDomainResults, writtenResult.domains);

      const mcqPriScore = Number(mcqResult.totalScore || 0);
      const writtenPriScore = Number(writtenResult.totalScore || 0);
      const percentage = buildPriPercentage(mcqPriScore, writtenPriScore, 2);
      totalScoreSum += percentage;

      // Save core PRI evaluation first so insights service can read the latest data.
      const savedEvaluation = await PriTestEvaluation.findOneAndUpdate(
        {
          responseId: response._id,
          questionBankId: bankId,
          studentUserId: response.studentUserId,
        },
        {
          responseId: response._id,
          batch: response.batch,
          questionBankId: bankId,
          studentUserId: response.studentUserId,
          institutionId: response.institutionId,
          status: 'completed',
          mcqCorrect,
          mcqTotal,
          totalScore: percentage,
          percentage,
          domains: domainResults.map(d => ({
            domainId: d.domainId,
            domainName: d.domainName,
            domainShare: d.domainShare,
            attempted: d.answered,
            correct: d.correct,
            total: d.total,
            score: d.score,
            subskills: d.subskills.map(s => ({
              name: s.name,
              share: s.share,
              priContribution: s.priContribution,
              attempted: s.answered,
              correct: s.correct,
              total: s.total,
              score: s.score,
            })),
          })),
          overallStatus: psychOverallStatus,
          traitResults: psychTraitResults,
          evaluatedAt: new Date(),
          mcqPriScore,
          writtenPriScore,
          psychometricPriScore: 0,
          priGatewayPassed: psychOverallStatus === 'pass',
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      // ── Student Insights fetch (non-blocking) ──────────────────────────────
      const fallbackInsightsUrl = `${request.nextUrl.origin}/api/insights/${encodeURIComponent(String(response.studentUserId))}`;
      const insightsUrl = normalizedInsightsBaseUrl
        ? `${normalizedInsightsBaseUrl}/insights/${encodeURIComponent(String(response.studentUserId))}`
        : fallbackInsightsUrl;
      const insightsHeaders: Record<string, string> = {};
      if (authHeader) insightsHeaders.Authorization = authHeader;

      try {
        const insightsRes = await Promise.race([
          fetch(insightsUrl, { headers: insightsHeaders }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Insights fetch timeout')), 120000)
          ),
        ]) as Response;

        if (insightsRes.ok) {
          const aiInsights = await insightsRes.json() as Record<string, unknown>;
          if (savedEvaluation?._id) {
            await PriTestEvaluation.findByIdAndUpdate(savedEvaluation._id, {
              aiInsights,
              insightsFetchedAt: new Date(),
            });
          }
        } else {
          console.warn(`[evaluate] Insights fetch failed for ${response.studentUserId}: HTTP ${insightsRes.status}`);
        }
      } catch (err) {
        console.warn(`[evaluate] Insights fetch error for ${response.studentUserId}:`, err);
      }

      // Mark the response evaluationStatus as reviewed
      await PriTestResponse.findByIdAndUpdate(response._id, { evaluationStatus: 'reviewed' });

      evaluated++;
    }

    const avgScore = evaluated > 0 ? Number((totalScoreSum / evaluated).toFixed(2)) : 0;

    return NextResponse.json({
      evaluated,
      avgScore,
      total: responses.length,
      message: `Evaluated ${evaluated} student response(s). Average PRI score: ${avgScore}%.`,
    }, { status: 200 });

  } catch (error) {
    console.error('[POST /api/admin/pri-tests/:id/evaluate]', error);
    return NextResponse.json({ error: 'Failed to generate PRI evaluation' }, { status: 500 });
  }
}

/**
 * GET /api/admin/pri-tests/:id/evaluate
 * Admin: Fetch current evaluation summary for a test.
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  const institutionAdmin = !admin ? getInstitutionAdminFromAuthHeader(request.headers.get('Authorization')) : null;
  if (!admin && !institutionAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await connectDB();
    const bankId = new mongoose.Types.ObjectId(id);

    // Build response filter: institution admins only see their own students
    const responseFilter: Record<string, unknown> = { questionBankId: bankId, status: 'submitted' };
    const evalFilter: Record<string, unknown> = { questionBankId: bankId };
    if (institutionAdmin) {
      responseFilter.institutionId = new mongoose.Types.ObjectId(institutionAdmin.institutionId);
      evalFilter.institutionId = new mongoose.Types.ObjectId(institutionAdmin.institutionId);
    }

    const [responses, evaluations] = await Promise.all([
      PriTestResponse.find(responseFilter)
        .populate({
          path: 'studentUserId',
          select: 'fullName username studentId',
          model: UserAccount
        })
        .lean(),
      PriTestEvaluation.find(evalFilter).lean(),
    ]);

    const evaluationMap = new Map(evaluations.map(e => [e.responseId.toString(), e]));
    
    // Combine to show both evaluated and pending students
    const studentResults = responses.map(resp => {
      const evaluation = evaluationMap.get(resp._id.toString());
      // traitResults is stored as a Mongoose Map — convert to plain object for JSON
      const traitResultsRaw = evaluation?.traitResults;
      const traitResults: Record<string, { score: number; maxScore: number; passed: boolean }> = {};
      if (traitResultsRaw) {
        const entries = traitResultsRaw instanceof Map
          ? Array.from(traitResultsRaw.entries())
          : Object.entries(traitResultsRaw as Record<string, unknown>);
        for (const [k, v] of entries) {
          const val = v as { score?: number; maxScore?: number; passed?: boolean };
          traitResults[k] = {
            score: val?.score ?? 0,
            maxScore: val?.maxScore ?? 0,
            passed: val?.passed ?? false,
          };
        }
      }
      const mcqPriScore = Number(evaluation?.mcqPriScore || 0);
      const writtenPriScore = Number(evaluation?.writtenPriScore || 0);
      const rawStoredPercentage = Number(evaluation?.percentage || 0);
      const effectivePercentage =
        rawStoredPercentage > 0
          ? rawStoredPercentage
          : buildPriPercentage(mcqPriScore, writtenPriScore, 2);

      return {
        _id: evaluation?._id || `pending-${resp._id}`,
        responseId: resp._id,
        studentUserId: resp.studentUserId, // Populated
        status: evaluation ? 'completed' : 'pending',
        percentage: effectivePercentage,
        totalScore: effectivePercentage,
        mcqCorrect: evaluation?.mcqCorrect || 0,
        mcqTotal: evaluation?.mcqTotal || 0,
        domains: evaluation?.domains || [],
        overallStatus: evaluation?.overallStatus || 'pending',
        traitResults,
        evaluatedAt: evaluation?.evaluatedAt,
        // Pipeline-specific score breakdown
        mcqPriScore,
        writtenPriScore,
        psychometricPriScore: 0,
        priGatewayPassed: evaluation?.priGatewayPassed ?? true,
        // Include basic response info if not evaluated
        testAttempted: resp.answers?.length || 0,
      };
    });

    const evaluatedCount = evaluations.length;
    const avgScore = evaluatedCount > 0
      ? Number((evaluations.reduce((sum, e) => {
          const stored = Number(e.percentage || 0);
          if (stored > 0) return sum + stored;
          return sum + buildPriPercentage(Number(e.mcqPriScore || 0), Number(e.writtenPriScore || 0), 2);
        }, 0) / evaluatedCount).toFixed(2))
      : 0;

    return NextResponse.json({
      totalSubmitted: responses.length,
      totalEvaluated: evaluatedCount,
      avgScore,
      evaluations: studentResults,
    }, { status: 200 });

  } catch (error) {
    console.error('[GET /api/admin/pri-tests/:id/evaluate]', error);
    return NextResponse.json({ error: 'Failed to fetch evaluation summary' }, { status: 500 });
  }
}
