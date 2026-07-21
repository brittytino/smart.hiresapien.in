import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import PriTestBank from '@/models/PriTestBank';
import Batch from '@/models/Batch';
import UserAccount from '@/models/UserAccount';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import BatchInsight from '@/models/BatchInsight';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';
import { generateBatchInsights } from '@/lib/ai/ai-router';
import { buildBatchPrompt, type BatchPromptInput } from '@/lib/insights/batch-prompt-builder';

type BatchStudent = {
  id: string;
  username: string;
  fullName?: string;
  studentId?: string;
  batch?: string;
  programme?: string;
  latestEvaluation?: {
    responseId?: string;
    percentage?: number;
    totalScore?: number;
    mcqCorrect?: number;
    mcqTotal?: number;
    overallStatus?: 'pass' | 'fail' | 'pending';
    evaluatedAt?: string;
    domains?: Array<{
      domainName?: string;
      domainId?: string;
      domainShare?: number;
      score?: number;
      correct?: number;
      total?: number;
      subskills?: Array<{
        name?: string;
        score?: number;
        correct?: number;
        total?: number;
      }>;
    }>;
    hasAiInsights?: boolean;
    priGatewayPassed?: boolean;
  } | null;
};

type BatchAggregate = {
  batchName: string;
  averageScore: number;
  totalStudents: number;
  students: BatchStudent[];
};

type BatchDomainStat = {
  domainName: string;
  averageAccuracy: number;
  averageScore: number;
  weakCount: number;
  strongCount: number;
  subskillWeaknesses: Array<{
    name: string;
    averageAccuracy: number;
    weakCount: number;
  }>;
};

type BatchStudentRisk = {
  id: string;
  username: string;
  fullName?: string;
  studentId?: string;
  percentage: number;
  overallStatus?: 'pass' | 'fail' | 'pending';
  evaluatedAt?: string;
  weakDomains: string[];
  riskReason: string;
};

type BatchInsightPayload = {
  summaryInsight?: string;
  cohortReadiness?: string;
  topFindings?: string[];
  weakDomains?: Array<{
    domainName: string;
    averageAccuracy: number;
    riskCount: number;
    intervention: string;
    whyItMatters: string;
  }>;
  urgentStudents?: Array<{
    studentName: string;
    username: string;
    riskReason: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  recommendedActions?: string[];
  [key: string]: unknown;
};

type BatchStatus = 'generated' | 'skipped_threshold' | 'failed' | 'not_generated';

const MIN_EVALUATED_STUDENTS = 3;
const PROMPT_VERSION = 'batch-insights-v1';

function normalizeBatchKey(value: string): string {
  return String(value || 'Unassigned').trim().toLowerCase();
}

function safePercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

function getDisplayName(student: BatchStudent): string {
  return student.fullName || student.username || student.studentId || 'Student';
}

async function loadStoredInsights(institutionId: string, batchNames: string[]) {
  const docs = await BatchInsight.find({
    institutionId: new mongoose.Types.ObjectId(institutionId),
    batchKey: { $in: batchNames.map(normalizeBatchKey) },
  }).lean();

  return new Map<string, any>(docs.map((doc: any) => [String(doc.batchKey), doc]));
}

function normalizeInsightPayload(payload: Record<string, unknown> | null | undefined): BatchInsightPayload | null {
  if (!payload) return null;

  const aiInsights = payload.aiInsights && typeof payload.aiInsights === 'object'
    ? payload.aiInsights as Record<string, unknown>
    : payload;

  return {
    summaryInsight: typeof aiInsights.summaryInsight === 'string' ? aiInsights.summaryInsight : '',
    cohortReadiness: typeof aiInsights.cohortReadiness === 'string' ? aiInsights.cohortReadiness : '',
    topFindings: Array.isArray(aiInsights.topFindings) ? aiInsights.topFindings.filter((item): item is string => typeof item === 'string') : [],
    weakDomains: Array.isArray(aiInsights.weakDomains)
      ? aiInsights.weakDomains.filter((item): item is { domainName: string; averageAccuracy: number; riskCount: number; intervention: string; whyItMatters: string } => Boolean(item && typeof item === 'object'))
      : [],
    urgentStudents: Array.isArray(aiInsights.urgentStudents)
      ? aiInsights.urgentStudents.filter((item): item is { studentName: string; username: string; riskReason: string; priority: 'High' | 'Medium' | 'Low' } => Boolean(item && typeof item === 'object'))
      : [],
    recommendedActions: Array.isArray(aiInsights.recommendedActions)
      ? aiInsights.recommendedActions.filter((item): item is string => typeof item === 'string')
      : [],
  };
}

function buildBatchAnalytics(batch: BatchAggregate) {
  const studentsWithEvaluations = batch.students.filter((student) => student.latestEvaluation?.responseId);
  const evaluatedStudents = studentsWithEvaluations.length;
  const passCount = studentsWithEvaluations.filter((student) => student.latestEvaluation?.overallStatus === 'pass').length;
  const passRate = evaluatedStudents > 0 ? roundPercent((passCount / evaluatedStudents) * 100) : 0;

  const domainMap = new Map<string, {
    totalAccuracy: number;
    totalScore: number;
    count: number;
    weakCount: number;
    strongCount: number;
    subskills: Map<string, { totalAccuracy: number; count: number; weakCount: number }>;
  }>();

  const studentRisks: BatchStudentRisk[] = [];
  const urgentStudents: BatchStudentRisk[] = [];

  for (const student of studentsWithEvaluations) {
    const evaluation = student.latestEvaluation!;
    const percentage = safePercent(evaluation.percentage || 0);
    const weakDomains: string[] = [];

    for (const domain of evaluation.domains || []) {
      const domainName = domain.domainName || 'Unknown Domain';
      const total = Math.max(domain.total || 0, 0);
      const correct = Math.max(domain.correct || 0, 0);
      const accuracy = total > 0 ? (correct / total) * 100 : (domain.score || 0);
      const domainScore = safePercent(accuracy);

      if (!domainMap.has(domainName)) {
        domainMap.set(domainName, {
          totalAccuracy: 0,
          totalScore: 0,
          count: 0,
          weakCount: 0,
          strongCount: 0,
          subskills: new Map<string, { totalAccuracy: number; count: number; weakCount: number }>(),
        });
      }

      const bucket = domainMap.get(domainName)!;
      bucket.totalAccuracy += domainScore;
      bucket.totalScore += safePercent(domain.score || 0);
      bucket.count += 1;
      if (domainScore < 50) bucket.weakCount += 1;
      if (domainScore >= 75) bucket.strongCount += 1;

      if (domainScore < 50) {
        weakDomains.push(domainName);
      }

      for (const subskill of domain.subskills || []) {
        const subskillName = subskill.name || 'Unknown Subskill';
        const subskillTotal = Math.max(subskill.total || 0, 0);
        const subskillCorrect = Math.max(subskill.correct || 0, 0);
        const subskillAccuracy = subskillTotal > 0 ? (subskillCorrect / subskillTotal) * 100 : (subskill.score || 0);

        if (!bucket.subskills.has(subskillName)) {
          bucket.subskills.set(subskillName, { totalAccuracy: 0, count: 0, weakCount: 0 });
        }

        const subskillBucket = bucket.subskills.get(subskillName)!;
        subskillBucket.totalAccuracy += safePercent(subskillAccuracy);
        subskillBucket.count += 1;
        if (subskillAccuracy < 50) subskillBucket.weakCount += 1;
      }
    }

    const riskReason = weakDomains.length > 0
      ? `${weakDomains.slice(0, 3).join(', ')} weakness${weakDomains.length > 1 ? 'es' : ''}`
      : percentage < 60
        ? 'Low overall readiness'
        : 'Monitoring candidate';

    const riskStudent: BatchStudentRisk = {
      id: student.id,
      username: student.username,
      fullName: student.fullName,
      studentId: student.studentId,
      percentage,
      overallStatus: evaluation.overallStatus,
      evaluatedAt: evaluation.evaluatedAt,
      weakDomains,
      riskReason,
    };

    studentRisks.push(riskStudent);
    if (percentage < 60 || weakDomains.length >= 2 || evaluation.overallStatus === 'fail') {
      urgentStudents.push(riskStudent);
    }
  }

  const weakDomains: BatchDomainStat[] = Array.from(domainMap.entries())
    .map(([domainName, bucket]) => {
      const subskillWeaknesses = Array.from(bucket.subskills.entries())
        .map(([name, subskillBucket]) => ({
          name,
          averageAccuracy: subskillBucket.count > 0 ? roundPercent(subskillBucket.totalAccuracy / subskillBucket.count) : 0,
          weakCount: subskillBucket.weakCount,
        }))
        .sort((a, b) => a.averageAccuracy - b.averageAccuracy)
        .slice(0, 5);

      return {
        domainName,
        averageAccuracy: bucket.count > 0 ? roundPercent(bucket.totalAccuracy / bucket.count) : 0,
        averageScore: bucket.count > 0 ? roundPercent(bucket.totalScore / bucket.count) : 0,
        weakCount: bucket.weakCount,
        strongCount: bucket.strongCount,
        subskillWeaknesses,
      };
    })
    .sort((a, b) => a.averageAccuracy - b.averageAccuracy);

  const topSubskillGaps = weakDomains
    .flatMap((domain) => domain.subskillWeaknesses.map((subskill) => ({
      domainName: domain.domainName,
      subSkillName: subskill.name,
      averageAccuracy: subskill.averageAccuracy,
      weakCount: subskill.weakCount,
    })))
    .sort((a, b) => a.averageAccuracy - b.averageAccuracy);

  const averageScore = studentsWithEvaluations.length > 0
    ? roundPercent(studentsWithEvaluations.reduce((sum, student) => sum + safePercent(student.latestEvaluation?.percentage || 0), 0) / studentsWithEvaluations.length)
    : 0;

  const promptInput: BatchPromptInput = {
    institutionId: '',
    batchName: batch.batchName,
    totalStudents: batch.totalStudents,
    evaluatedStudents,
    averageScore,
    passRate,
    weakDomains,
    urgentStudents: urgentStudents.sort((a, b) => a.percentage - b.percentage).slice(0, 8),
    topSubskillGaps,
  };

  return {
    evaluatedStudents,
    passRate,
    averageScore,
    weakDomains,
    urgentStudents: urgentStudents.sort((a, b) => a.percentage - b.percentage),
    studentRisks: studentRisks.sort((a, b) => a.percentage - b.percentage),
    topSubskillGaps,
    promptInput,
  };
}

export async function GET(request: NextRequest) {
  const admin = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const generate = request.nextUrl.searchParams.get('generate') === 'true';
  const forceRefresh = request.nextUrl.searchParams.get('force_refresh') === 'true';

  try {
    await connectDB();

    const institutionObjectId = new mongoose.Types.ObjectId(admin.institutionId);
    const batches = await Batch.find({ institutionId: institutionObjectId }).sort({ createdAt: -1 }).lean();

    const batchNames = batches.map((batch) => batch.name);
    const students = await UserAccount.find({
      institutionId: institutionObjectId,
      role: 'student',
      batch: { $exists: true, $ne: '' },
    })
      .select('_id username fullName studentId batch programme')
      .lean();

    const studentIds = students.map((student) => student._id);
    // Find the latest exam for the institution to filter all insights
    const latestExamEval = await PriTestEvaluation.findOne({
      institutionId: institutionObjectId,
      status: 'completed'
    })
      .sort({ evaluatedAt: -1 })
      .populate('questionBankId', 'title')
      .lean();

    const lastExamId = latestExamEval?.questionBankId?._id;
    const lastExamTitle = (latestExamEval?.questionBankId as any)?.title || 'Latest PRI Exam';
    const lastExamDate = latestExamEval?.evaluatedAt;

    const evaluations = studentIds.length
      ? await PriTestEvaluation.aggregate([
          {
            $match: {
              institutionId: institutionObjectId,
              studentUserId: { $in: studentIds },
              status: 'completed',
              ...(lastExamId ? { questionBankId: lastExamId } : {})
            },
          },
          { $sort: { evaluatedAt: -1, createdAt: -1 } },
          {
            $group: {
              _id: '$studentUserId',
              evaluation: { $first: '$$ROOT' },
            },
          },
        ])
      : [];

    const evaluationMap = new Map<string, any>(
      evaluations.map((entry: any) => [String(entry._id), entry.evaluation])
    );

    const batchMap = new Map<string, BatchAggregate>();
    for (const batch of batches as any[]) {
      batchMap.set(batch.name, {
        batchName: batch.name,
        averageScore: 0,
        totalStudents: 0,
        students: [],
      });
    }

    for (const student of students as any[]) {
      const batchName = String(student.batch || '').trim();
      if (!batchName) continue;

      if (!batchMap.has(batchName)) {
        batchMap.set(batchName, {
          batchName,
          averageScore: 0,
          totalStudents: 0,
          students: [],
        });
      }

      const latestEvaluation = evaluationMap.get(String(student._id));
      const normalizedEvaluation = latestEvaluation
        ? {
            responseId: String(latestEvaluation.responseId || ''),
            percentage: latestEvaluation.percentage,
            totalScore: latestEvaluation.totalScore,
            mcqCorrect: latestEvaluation.mcqCorrect,
            mcqTotal: latestEvaluation.mcqTotal,
            overallStatus: latestEvaluation.overallStatus,
            evaluatedAt: latestEvaluation.evaluatedAt ? new Date(latestEvaluation.evaluatedAt).toISOString() : undefined,
            domains: latestEvaluation.domains,
            hasAiInsights: Boolean(latestEvaluation.aiInsights),
            priGatewayPassed: latestEvaluation.priGatewayPassed,
          }
        : null;

      const batchEntry = batchMap.get(batchName)!;
      batchEntry.totalStudents += 1;
      batchEntry.students.push({
        id: String(student._id),
        username: student.username,
        fullName: student.fullName,
        studentId: student.studentId,
        batch: student.batch,
        programme: student.programme,
        latestEvaluation: normalizedEvaluation,
      });
    }

    const baseBatches = Array.from(batchMap.values()).map((batch) => {
      const evaluatedStudents = batch.students.filter((student) => student.latestEvaluation?.responseId).length;
      const averageScore = evaluatedStudents > 0
        ? roundPercent(
            batch.students
              .filter((student) => student.latestEvaluation?.responseId)
              .reduce((sum, student) => sum + safePercent(student.latestEvaluation?.percentage || 0), 0) / evaluatedStudents
          )
        : 0;
      return {
        ...batch,
        averageScore,
      };
    }).sort((a, b) => a.batchName.localeCompare(b.batchName));

    const storedInsights = await loadStoredInsights(admin.institutionId, batchNames.length ? batchNames : baseBatches.map((batch) => batch.batchName));

    const batchesOutput: Array<BatchAggregate & {
      evaluatedStudents: number;
      passRate: number;
      aiInsightStatus: BatchStatus;
      aiGeneratedAt?: string | null;
      aiProvider?: string | null;
      aiInsights?: BatchInsightPayload | null;
      batchMetrics: ReturnType<typeof buildBatchAnalytics>;
    }> = [];

    const generationSummary = {
      requested: generate,
      generated: 0,
      skippedThreshold: 0,
      failed: 0,
    };

    for (const batch of baseBatches) {
      const batchMetrics = buildBatchAnalytics(batch);
      const batchKey = normalizeBatchKey(batch.batchName);
      const stored = storedInsights.get(batchKey);
      let aiInsights: BatchInsightPayload | null = stored ? normalizeInsightPayload(stored.aiInsights) : null;
      let aiInsightStatus: BatchStatus = stored ? 'generated' : 'not_generated';
      let aiGeneratedAt: string | null = stored?.generatedAt ? new Date(stored.generatedAt).toISOString() : null;
      let aiProvider: string | null = stored?.provider || null;

      if (generate) {
        if (batchMetrics.evaluatedStudents < MIN_EVALUATED_STUDENTS) {
          generationSummary.skippedThreshold += 1;
          aiInsightStatus = stored ? 'generated' : 'skipped_threshold';
          aiInsights = stored ? aiInsights : null;
        } else {
          try {
            const promptInput = {
              ...batchMetrics.promptInput,
              institutionId: String(admin.institutionId),
            };
            const prompt = buildBatchPrompt(promptInput);
            const aiResult = await generateBatchInsights(
              `${admin.institutionId}:${batch.batchName}`,
              prompt,
              forceRefresh,
            );
            const normalized = normalizeInsightPayload(aiResult);

            aiInsights = normalized;
            aiInsightStatus = 'generated';
            aiGeneratedAt = new Date().toISOString();
            aiProvider = 'claude-or-gemini';
            generationSummary.generated += 1;

            await BatchInsight.updateOne(
              {
                institutionId: institutionObjectId,
                batchKey,
              },
              {
                $set: {
                  institutionId: institutionObjectId,
                  batchKey,
                  batchName: batch.batchName,
                  totalStudents: batch.totalStudents,
                  evaluatedStudents: batchMetrics.evaluatedStudents,
                  averageScore: batchMetrics.averageScore,
                  passRate: batchMetrics.passRate,
                  provider: aiProvider,
                  generationMode: 'manual',
                  status: 'generated',
                  aiInsights: normalized,
                  batchMetrics: {
                    weakDomains: batchMetrics.weakDomains,
                    urgentStudents: batchMetrics.urgentStudents,
                    topSubskillGaps: batchMetrics.topSubskillGaps,
                    totalStudents: batch.totalStudents,
                    evaluatedStudents: batchMetrics.evaluatedStudents,
                    averageScore: batchMetrics.averageScore,
                    passRate: batchMetrics.passRate,
                  },
                  promptVersion: PROMPT_VERSION,
                  generatedAt: new Date(),
                },
              },
              { upsert: true }
            );
          } catch (error: any) {
            generationSummary.failed += 1;
            aiInsightStatus = stored ? 'generated' : 'failed';
            console.error('[GET /api/institution-admin/batches/insights] AI generation failed for batch:', batch.batchName, error);
          }
        }
      }

      batchesOutput.push({
        ...batch,
        averageScore: batch.averageScore,
        evaluatedStudents: batchMetrics.evaluatedStudents,
        passRate: batchMetrics.passRate,
        aiInsightStatus,
        aiGeneratedAt,
        aiProvider,
        aiInsights,
        batchMetrics,
      });
    }

    return NextResponse.json({
      batches: batchesOutput,
      generationSummary,
      promptVersion: PROMPT_VERSION,
      minimumEvaluatedStudents: MIN_EVALUATED_STUDENTS,
      lastExam: lastExamId ? {
        id: String(lastExamId),
        title: lastExamTitle,
        date: lastExamDate
      } : null
    });
  } catch (error: any) {
    console.error('Batch Insights API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
