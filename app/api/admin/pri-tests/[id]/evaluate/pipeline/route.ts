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
import { runAIEvaluation } from '@/lib/evaluation-engine';

type InsightsSkipReason =
  | 'none'
  | 'timeout'
  | 'unauthorized'
  | 'no_evaluation_data'
  | 'service_unavailable'
  | 'http_error'
  | 'invalid_payload';

/**
 * POST /api/admin/pri-tests/:id/evaluate/pipeline
 *
 * Full 5-stage evaluation pipeline per student:
 *   1. Psychometric Gateway (≥3 traits = pass, else student PRI = 0)
 *   2. MCQ Scoring
 *   3. Written Intelligence Scoring
 *   4. Student Insights fetch (external microservice, non-blocking)
 *   5. Save full report to DB
 */

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  const admin = getAdminFromAuthHeader(authHeader);
  const institutionAdmin = !admin
    ? getInstitutionAdminFromAuthHeader(authHeader)
    : null;
  if (!admin && !institutionAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await connectDB();
    const bankId = new mongoose.Types.ObjectId(id);
    const responseFilter: Record<string, unknown> = {
      questionBankId: bankId,
      status: 'submitted',
      evaluationStatus: { $ne: 'reviewed' },
    };
    if (institutionAdmin) {
      responseFilter.institutionId = new mongoose.Types.ObjectId(institutionAdmin.institutionId);
    }
    const pendingResponses = await PriTestResponse.find(responseFilter, '_id studentUserId studentName studentUsername').lean();
    return NextResponse.json({ pendingCount: pendingResponses.length, responses: pendingResponses });
  } catch (error) {
    console.error('[GET /api/admin/pri-tests/:id/evaluate/pipeline]', error);
    return NextResponse.json({ error: 'Failed to fetch pending responses' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  const admin = getAdminFromAuthHeader(authHeader);
  const institutionAdmin = !admin
    ? getInstitutionAdminFromAuthHeader(authHeader)
    : null;
  if (!admin && !institutionAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    const targetResponseId = body.responseId;

    const responseFilter: Record<string, unknown> = {
      questionBankId: bankId,
      status: 'submitted',
      evaluationStatus: { $ne: 'reviewed' },
    };
    if (institutionAdmin) {
      responseFilter.institutionId = new mongoose.Types.ObjectId(institutionAdmin.institutionId);
    }
    if (targetResponseId) {
      responseFilter._id = new mongoose.Types.ObjectId(targetResponseId);
    }

    const responses = await PriTestResponse.find(responseFilter).lean();
    if (responses.length === 0) {
      return NextResponse.json({
        totalStudents: 0,
        stages: {
          psychometric: { done: true, passed: 0, failed: 0 },
          mcq: { done: true },
          written: { done: true },
          insights: { done: true, fetched: 0, skipped: 0 },
          report: { done: true, saved: 0 },
        },
        students: [],
        message: 'No submitted responses found.',
      });
    }

    // ── Generate solution key once from bank (same for all students) ──────────
    // PriTestBank questions have _id:false, so use array index as the stable questionId.
    // This matches answer.questionIndex used throughout the evaluation engine.
    const solutionKey = questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => q.questionType === 'mcq' && q.domainId !== 'workspace-psychology')
      .map(({ q, idx }) => ({
        questionId: String(idx),
        questionText: q.questionText ?? '',
        correctAnswer: q.correctAnswer ?? '',
        domain: q.domainId ?? '',
        subSkill: q.subSkill ?? '',
      }));

    const insightsBaseUrl = process.env.INSIGHTS_SERVICE_URL || process.env.STUDENT_INSIGHTS_SERVICE_URL;
    const normalizedInsightsBaseUrl = insightsBaseUrl?.replace(/\/+$/, '') ?? '';
    const businessEvalUrl = process.env.BUSINESS_EVAL_SERVICE_URL;

    // ── PRE-STAGE: Run Business AI Evaluation (saves aiEvaluation to each answer) ──
    // Directly run AI evaluation logic since it's now internal to the project
    let businessEvalRan = false;
    try {
      const bizData = await runAIEvaluation(targetResponseId);
      if (bizData.success) {
        // Persist each result to the matching student response's answer
        for (const result of bizData.results ?? []) {
          if (result.error) continue;
          const { testResponseId, questionId, evaluation } = result;
          const doc = await PriTestResponse.findById(testResponseId);
          if (!doc) continue;
          let changed = false;
          for (let i = 0; i < (doc.answers?.length ?? 0); i++) {
            if (doc.answers[i].questionType === 'written' && doc.answers[i].questionId === questionId) {
              doc.answers[i].aiEvaluation = {
                scores: {
                  task_completion: evaluation.scores?.task_completion ?? 0,
                  clarity_and_brevity: evaluation.scores?.clarity_and_brevity ?? 0,
                  logical_structure: evaluation.scores?.logical_structure ?? 0,
                  professional_tone: evaluation.scores?.professional_tone ?? 0,
                  critical_thinking: evaluation.scores?.critical_thinking ?? 0,
                },
                feedback: evaluation.feedback ?? '',
                averageScore: evaluation.averageScore ?? 0,
                evaluatedAt: new Date(),
              };
              doc.answers[i].evaluationStatus = 'auto';
              changed = true;
            }
          }
          if (changed) {
            doc.markModified('answers');
            await doc.save();
          }
        }
        businessEvalRan = true;
      } else {
        console.warn(`[pipeline] Business eval logic failed — written scores may be 0`);
      }
    } catch (err) {
      console.warn('[pipeline] Business eval failed (non-blocking):', err);
    }

    // Re-fetch responses so evaluateWrittenResponse() sees freshly saved aiEvaluation scores
    const freshResponses = await PriTestResponse.find(responseFilter).lean();
    const freshResponseMap = new Map(freshResponses.map(r => [r._id.toString(), r]));

    // Stage counters
    let psychPassed = 0;
    let psychFailed = 0;
    let insightsFetched = 0;
    let insightsSkipped = 0;
    let reportsSaved = 0;

    const studentResults: {
      studentId: string;
      name: string;
      priGatewayPassed: boolean;
      psychometricStatus: 'pass' | 'fail';
      passedTraits: number;
      totalTraits: number;
      mcqPriScore: number;
      writtenPriScore: number;
      psychometricPriScore: number;
      totalPriScore: number;
      overallStatus: 'pass' | 'fail';
      insightsFetched: boolean;
      insights: {
        status: 'fetched' | 'skipped';
        source: 'external' | 'internal';
        reason: InsightsSkipReason;
        httpStatus?: number;
        error?: string;
      };
    }[] = [];

    for (const response of responses) {
      const studentUserId = String(response.studentUserId);
      const studentName =
        (response as any).studentName ||
        (response as any).studentUsername ||
        studentUserId;

      // ── STAGE 1: PSYCHOMETRIC GATEWAY ─────────────────────────────────────
      const psychDomain = testBank.domains?.find(
        (d) => d.domainId === 'workspace-psychology'
      );

      let priGatewayPassed = true; // default pass if no psychometric domain
      let psychOverallStatus: 'pass' | 'fail' = 'pass';
      let passedTraitsCount = 0;
      let totalTraitsCount = 0;
      let psychometricPriScore = 0;
      let psychTraitResults: Record<string, { score: number; maxScore: number; passed: boolean }> = {};

      if (psychDomain) {
        const psychScores: Record<string, number> = {};
        const psychQuestions = questions.filter(
          (q) => q.domainId === 'workspace-psychology'
        );

        const questionsByTrait = new Map<string, typeof psychQuestions>();
        psychQuestions.forEach((q) => {
          const list = questionsByTrait.get(q.subSkill) || [];
          list.push(q);
          questionsByTrait.set(q.subSkill, list);
        });

        psychDomain.subskills.forEach((sub) => {
          psychScores[sub.name] = 0;
        });

        for (const answer of response.answers ?? []) {
          const question = questions[answer.questionIndex];
          if (!question || question.domainId !== 'workspace-psychology') continue;
          const selectedLabel = answer.selectedOption;
          const option = question.options?.find((o) => o.label === selectedLabel);
          const score = option?.score ?? -1.0;
          psychScores[question.subSkill] = (psychScores[question.subSkill] || 0) + score;
        }

        totalTraitsCount = psychDomain.subskills.length;
        let totalPsychScore = 0;
        let totalPsychMaxScore = 0;

        for (const sub of psychDomain.subskills) {
          const traitScore = psychScores[sub.name] || 0;
          const traitQs = questionsByTrait.get(sub.name) || [];
          const maxTraitScore = traitQs.length * 1.0;
          
          totalPsychScore += traitScore;
          totalPsychMaxScore += maxTraitScore;

          const traitPassed = traitScore >= maxTraitScore / 2;
          if (traitPassed) passedTraitsCount++;
          psychTraitResults[sub.name] = {
            score: traitScore,
            maxScore: maxTraitScore,
            passed: traitPassed,
          };
        }

        // Changed requirement: Overall Psychometric pass if Total Score > 50% of Max Score
        priGatewayPassed = totalPsychMaxScore > 0 ? (totalPsychScore > (totalPsychMaxScore / 2)) : true;
        psychOverallStatus = priGatewayPassed ? 'pass' : 'fail';

        // Psychometric does not contribute to PRI marks.
        psychometricPriScore = 0;

        const aiAnalysis = priGatewayPassed
          ? 'Evaluation complete. Student has successfully cleared the behavioral gateway by scoring over 50%.'
          : 'Evaluation complete. Student did not clear the behavioral gateway (Scored 50% or less).';

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

        if (priGatewayPassed) psychPassed++;
        else psychFailed++;
      }

      // ── STAGE 2: MCQ SCORING ───────────────────────────────────────────────
      const mcqResult = evaluateMcqResponse(testBank as any, response as any);
      const mcqPriScore = Number(mcqResult.totalScore.toFixed(2));

      // ── STAGE 2b: WRITE BACK isCorrect + correctAnswer TO RESPONSE ANSWERS ───
      // Persist computed MCQ results so each answer is self-contained in the DB.
      {
        const responseDoc = await PriTestResponse.findById(response._id);
        if (responseDoc) {
          const qMap = new Map<number, typeof questions[number]>();
          questions.forEach((q, idx) => qMap.set(idx, q));
          let changed = false;
          for (let i = 0; i < (responseDoc.answers?.length ?? 0); i++) {
            const ans = responseDoc.answers[i];
            if (ans.questionType !== 'mcq') continue;
            const q = qMap.get(ans.questionIndex);
            if (!q) continue;
            const correctAnswer = q.correctAnswer ?? '';
            const selected = ans.selectedOption ?? '';
            const isCorrect = correctAnswer && selected ? selected === correctAnswer : false;
            if (ans.isCorrect !== isCorrect || ans.correctAnswer !== correctAnswer) {
              responseDoc.answers[i].isCorrect = isCorrect;
              responseDoc.answers[i].correctAnswer = correctAnswer;
              changed = true;
            }
          }
          if (changed) {
            responseDoc.markModified('answers');
            await responseDoc.save();
          }
        }
      }

      // ── STAGE 3: WRITTEN INTELLIGENCE ─────────────────────────────────────
      // Use freshly saved response (has aiEvaluation populated by business eval above)
      const freshResponse = freshResponseMap.get(response._id.toString()) ?? response;
      const writtenResult = evaluateWrittenResponse(testBank as any, freshResponse as any);
      const writtenPriScore = Number(writtenResult.totalScore.toFixed(2));

      // ── STAGE 4: SAVE REPORT ───────────────────────────────────────────────
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

      const domainResults = mergeEvaluationResults(mcqDomainResults, writtenResult.domains);

      const rawTotal = mcqPriScore + writtenPriScore;
      const totalPriScore = Number(rawTotal.toFixed(2));
      let percentage = Number(Math.min(100, isFinite(totalPriScore) ? totalPriScore : 0).toFixed(2));
      if (percentage === 0 && mcqPriScore > 0) {
        percentage = 0.01;
      }

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
          mcqCorrect: mcqResult.mcqCorrect,
          mcqTotal: mcqResult.mcqTotal,
          totalScore: percentage,
          percentage,
          domains: domainResults.map((d) => ({
            domainId: d.domainId,
            domainName: d.domainName,
            domainShare: d.domainShare,
            attempted: d.answered,
            correct: d.correct,
            total: d.total,
            score: d.score,
            subskills: d.subskills.map((s) => ({
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
          // Pipeline-specific fields
          mcqPriScore,
          writtenPriScore,
          psychometricPriScore,
          priGatewayPassed,
          solutionKey,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      // ── STAGE 5: STUDENT INSIGHTS (non-blocking) ───────────────────────────
      let studentInsightsFetched = false;
      const fallbackInsightsUrl = `${request.nextUrl.origin}/api/insights/${encodeURIComponent(studentUserId)}`;
      const insightsUrl = normalizedInsightsBaseUrl
        ? `${normalizedInsightsBaseUrl}/insights/${encodeURIComponent(studentUserId)}`
        : fallbackInsightsUrl;
      const insightsSource: 'external' | 'internal' = normalizedInsightsBaseUrl ? 'external' : 'internal';
      let insightsReason: InsightsSkipReason = 'none';
      let insightsHttpStatus: number | undefined;
      let insightsError: string | undefined;
      const insightsHeaders: Record<string, string> = {};
      if (authHeader) insightsHeaders.Authorization = authHeader;

      try {
        const insightsRes = await Promise.race([
          fetch(insightsUrl, { headers: insightsHeaders }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Insights fetch timeout')), 150000)
          ),
        ]) as Response;

        if (insightsRes.ok) {
          const aiInsights = await insightsRes.json() as Record<string, unknown>;
          const hasUsableInsights = Boolean(
            aiInsights &&
            typeof aiInsights === 'object' &&
            (
              ('aiInsights' in aiInsights && (aiInsights as any).aiInsights) ||
              ('summaryInsight' in aiInsights) ||
              ('domains' in aiInsights)
            )
          );

          if (!hasUsableInsights) {
            insightsReason = 'invalid_payload';
            insightsError = 'Insights payload missing domain/summary fields';
            insightsSkipped++;
          } else if (savedEvaluation?._id) {
            await PriTestEvaluation.findByIdAndUpdate(savedEvaluation._id, {
              aiInsights,
              insightsFetchedAt: new Date(),
            });
            studentInsightsFetched = true;
            insightsFetched++;
          } else {
            insightsReason = 'no_evaluation_data';
            insightsError = 'Evaluation document missing after upsert';
            insightsSkipped++;
          }
        } else {
          insightsHttpStatus = insightsRes.status;
          if (insightsRes.status === 401 || insightsRes.status === 403) insightsReason = 'unauthorized';
          else if (insightsRes.status === 404) insightsReason = 'no_evaluation_data';
          else if (insightsRes.status >= 500) insightsReason = 'service_unavailable';
          else insightsReason = 'http_error';
          const body = await insightsRes.text();
          insightsError = body ? body.slice(0, 200) : `HTTP ${insightsRes.status}`;
          console.warn(
            `[pipeline] Insights fetch failed for ${studentUserId}: HTTP ${insightsRes.status}`
          );
          insightsSkipped++;
        }
      } catch (err) {
        insightsReason = 'timeout';
        insightsError = err instanceof Error ? err.message : 'Insights fetch failed';
        console.warn(`[pipeline] Insights fetch error for ${studentUserId}:`, err);
        insightsSkipped++;
      }

      await PriTestResponse.findByIdAndUpdate(response._id, {
        evaluationStatus: 'reviewed',
      });

      reportsSaved++;

      studentResults.push({
        studentId: (response as any).studentId || studentUserId,
        name: studentName,
        priGatewayPassed,
        psychometricStatus: psychOverallStatus,
        passedTraits: passedTraitsCount,
        totalTraits: totalTraitsCount,
        mcqPriScore,
        writtenPriScore,
        psychometricPriScore,
        totalPriScore,
        overallStatus: psychOverallStatus,
        insightsFetched: studentInsightsFetched,
        insights: {
          status: studentInsightsFetched ? 'fetched' : 'skipped',
          source: insightsSource,
          reason: studentInsightsFetched ? 'none' : insightsReason,
          httpStatus: insightsHttpStatus,
          error: studentInsightsFetched ? undefined : insightsError,
        },
      });
    }

    return NextResponse.json({
      totalStudents: responses.length,
      stages: {
        psychometric: { done: true, passed: psychPassed, failed: psychFailed },
        mcq: { done: true },
        written: { done: true },
        insights: { done: true, fetched: insightsFetched, skipped: insightsSkipped },
        report: { done: true, saved: reportsSaved },
      },
      students: studentResults,
      message: `Pipeline complete. ${reportsSaved} reports saved. ${psychFailed} student(s) failed the psychometric gateway.`,
    });
  } catch (error) {
    console.error('[POST /api/admin/pri-tests/:id/evaluate/pipeline]', error);
    return NextResponse.json(
      { error: 'Pipeline evaluation failed' },
      { status: 500 }
    );
  }
}
