import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import PsychometricResult from '@/models/PsychometricResult';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader } from '@/lib/auth';
import { evaluateMcqResponse } from '@/evaluation/pri-test-mcq';
import { evaluateWrittenResponse, mergeEvaluationResults } from '@/evaluation/pri-test-written';

// Truncate to single decimal place without rounding
function truncateToOneDecimal(value: number) {
  return Math.trunc(value * 10) / 10;
}

/**
 * POST /api/admin/reports/:id/regenerate
 * Regenerates PRI evaluation for a single submitted response.
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization') || '';
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: responseId } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(responseId)) {
    return NextResponse.json({ error: 'Invalid response id' }, { status: 400 });
  }

  try {
    await connectDB();

    const response = await PriTestResponse.findById(responseId).lean() as any;
    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }


    if (!response.questionBankId || !mongoose.Types.ObjectId.isValid(String(response.questionBankId))) {
      return NextResponse.json({ error: 'Invalid question bank reference' }, { status: 400 });
    }

    const bankId = new mongoose.Types.ObjectId(String(response.questionBankId));
    const testBank = await PriTestBank.findById(bankId).lean() as any;
    if (!testBank) {
      return NextResponse.json({ error: 'PRI test bank not found' }, { status: 404 });
    }

    const questions = testBank.questions ?? [];

    const solutionKey = questions
      .map((q: any, idx: number) => ({ q, idx }))
      .filter(({ q }: any) => q.questionType === 'mcq' && q.domainId !== 'workspace-psychology')
      .map(({ q, idx }: any) => ({
        questionId: String(idx),
        questionText: q.questionText ?? '',
        correctAnswer: q.correctAnswer ?? '',
        domain: q.domainId ?? '',
        subSkill: q.subSkill ?? '',
      }));

    const psychDomain = testBank.domains?.find((d: any) => d.domainId === 'workspace-psychology');

    let priGatewayPassed = true;
    let psychOverallStatus: 'pass' | 'fail' = 'pass';
    let passedTraitsCount = 0;
    let totalTraitsCount = 0;
    let psychometricPriScore = 0;
    let psychTraitResults: Record<string, { score: number; maxScore: number; passed: boolean }> = {};

    if (psychDomain) {
      const psychScores: Record<string, number> = {};
      const psychQuestions = questions.filter((q: any) => q.domainId === 'workspace-psychology');

      const questionsByTrait = new Map<string, any[]>();
      psychQuestions.forEach((q: any) => {
        const list = questionsByTrait.get(q.subSkill) || [];
        list.push(q);
        questionsByTrait.set(q.subSkill, list);
      });

      psychDomain.subskills.forEach((sub: any) => {
        psychScores[sub.name] = 0;
      });

      for (const answer of response.answers ?? []) {
        const question = questions[answer.questionIndex];
        if (!question || question.domainId !== 'workspace-psychology') continue;

        const selectedLabel = answer.selectedOption;
        const option = question.options?.find((o: any) => o.label === selectedLabel);
        const score = option?.score ?? -1.0;
        psychScores[question.subSkill] = (psychScores[question.subSkill] || 0) + score;
      }

      totalTraitsCount = psychDomain.subskills.length;
      for (const sub of psychDomain.subskills) {
        const traitScore = psychScores[sub.name] || 0;
        const traitQuestions = questionsByTrait.get(sub.name) || [];
        const maxTraitScore = traitQuestions.length * 1.0;
        const traitPassed = traitScore >= maxTraitScore / 2;

        if (traitPassed) passedTraitsCount++;
        psychTraitResults[sub.name] = {
          score: traitScore,
          maxScore: maxTraitScore,
          passed: traitPassed,
        };
      }

      priGatewayPassed = passedTraitsCount >= 3;
      psychOverallStatus = priGatewayPassed ? 'pass' : 'fail';

      // Psychometric does not contribute to PRI marks.
      psychometricPriScore = 0;

      const aiAnalysis = priGatewayPassed
        ? 'Evaluation complete. Student has successfully cleared the behavioral gateway.'
        : 'Evaluation complete. Student did not clear the behavioral gateway (< 3 traits passed).';

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
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const mcqResult = evaluateMcqResponse(testBank as any, response as any);
    const writtenResult = evaluateWrittenResponse(testBank as any, response as any);

    const mcqPriScore = truncateToOneDecimal(Number(mcqResult.totalScore ?? 0));
    const writtenPriScore = truncateToOneDecimal(Number(writtenResult.totalScore ?? 0));

    const mcqDomainResults = mcqResult.domains.map((d: any) => ({
      domainId: d.domainId,
      domainName: d.domainName,
      domainShare: d.domainShare,
      answered: d.answered,
      correct: d.correct,
      total: d.total,
      score: d.score,
      subskills: d.subskills.map((s: any) => ({
        name: s.name,
        share: s.share,
        priContribution: s.priContribution,
        answered: s.answered,
        correct: s.correct,
        total: s.total,
        score: s.score,
      })),
    }));

    const domainResults = mergeEvaluationResults(mcqDomainResults, writtenResult.domains);

    const rawTotal = mcqPriScore + writtenPriScore;
    const totalPriScore = truncateToOneDecimal(rawTotal);
    let percentage = Math.min(100, isFinite(totalPriScore) ? totalPriScore : 0);
    percentage = truncateToOneDecimal(percentage);
    if (percentage === 0 && mcqPriScore > 0) {
      percentage = 0.01;
    }

    const insightsBaseUrl = process.env.INSIGHTS_SERVICE_URL || process.env.STUDENT_INSIGHTS_SERVICE_URL;
    const normalizedInsightsBaseUrl = insightsBaseUrl?.replace(/\/+$/, '') ?? '';
    const fallbackInsightsUrl = `${request.nextUrl.origin}/api/insights/${encodeURIComponent(String(response.studentUserId))}`;
    const insightsUrl = normalizedInsightsBaseUrl
      ? `${normalizedInsightsBaseUrl}/insights/${encodeURIComponent(String(response.studentUserId))}?force_refresh=true`
      : `${fallbackInsightsUrl}?force_refresh=true`;
    const insightsSource = normalizedInsightsBaseUrl ? 'external' : 'internal';
    let aiInsights: Record<string, unknown> | null = null;
    let insightsFetchedAt: Date | undefined;
    let insightsError: string | null = null;
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
        aiInsights = await insightsRes.json();
        insightsFetchedAt = new Date();
      } else {
        const body = await insightsRes.text();
        insightsError = `Insights fetch failed (${insightsRes.status})${body ? `: ${body.slice(0, 200)}` : ''}`;
      }
    } catch (error) {
      insightsError = error instanceof Error ? error.message : 'Insights fetch failed';
      // Non-blocking: report regeneration should succeed even when insights fetch fails.
    }

    await PriTestEvaluation.findOneAndUpdate(
      {
        responseId: response._id,
        questionBankId: bankId,
        studentUserId: response.studentUserId,
      },
      {
        responseId: response._id,
        questionBankId: bankId,
        studentUserId: response.studentUserId,
        institutionId: response.institutionId,
        status: 'completed',
        mcqCorrect: mcqResult.mcqCorrect,
        mcqTotal: mcqResult.mcqTotal,
        totalScore: percentage,
        percentage,
        domains: domainResults.map((d: any) => ({
          domainId: d.domainId,
          domainName: d.domainName,
          domainShare: d.domainShare,
          attempted: d.answered,
          correct: d.correct,
          total: d.total,
          score: d.score,
          subskills: d.subskills.map((s: any) => ({
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
        psychometricPriScore,
        priGatewayPassed,
        aiInsights: aiInsights ?? undefined,
        solutionKey,
        insightsFetchedAt,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    await PriTestResponse.findByIdAndUpdate(response._id, { evaluationStatus: 'reviewed' });

    return NextResponse.json({
      message: 'PRI report regenerated successfully.',
      responseId,
      questionBankId: String(bankId),
      percentage,
      priGatewayPassed,
      insights: {
        status: aiInsights ? 'ok' : 'missing',
        source: insightsSource,
        error: insightsError,
      },
    });
  } catch (error) {
    console.error('[POST /api/admin/reports/:id/regenerate]', error);
    return NextResponse.json({ error: 'Failed to regenerate report' }, { status: 500 });
  }
}
