/**
 * MongoDB data extractor for GRAD360 Insights.
 * TypeScript port of both Python mongo_extractor.py files.
 *
 * Collections used:
 *   - pri_test_evaluations  : domain/subskill pre-scored breakdown per student
 *   - student_responses     : raw per-question answers (isCorrect) + domain timing
 *   - user_accounts         : student display name lookup
 *   - faculty_insights      : write-back for generated faculty insights
 */

import connectDB from '@/lib/mongodb';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import StudentResponse from '@/models/StudentResponse';
import UserAccount from '@/models/UserAccount';
import mongoose from 'mongoose';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SubSkillDetail {
  name:          string;
  accuracy:      number; // 0-100 integer
  avgTimeRatio:  number;
  correct:       number;
  total:         number;
}

export interface DomainData {
  accuracy:           number; // 0-1 float
  band:               'BLUE' | 'GREEN' | 'AMBER' | 'RED';
  questionsAttempted: number;
  correct:            number;
  avgTimeRatio:       number;
  totalTimeSec:       number;
  estTimeSec:         number;
  needsAttention:     number;
  weakSubSkills:      string[];
  strongSubSkills:    string[];
  subSkillDetails:    SubSkillDetail[];
  correctQuestions:   { subSkill: string; difficulty: string; timeTaken: number }[];
  wrongQuestions:     { subSkill: string; difficulty: string; timeTaken: number }[];
}

export interface StudentData {
  studentId:       string;
  studentUserId:   string;
  studentName:     string;
  studentUsername: string;
  batch:           string;
  programme:       string;
  priBand:         'BLUE' | 'GREEN' | 'AMBER' | 'RED';
  overallAccuracy: number; // 0-1
  overallScore:    number;
  examDate:        string;
  domains:         Record<string, DomainData>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function bandFromAccuracy(acc: number): 'BLUE' | 'GREEN' | 'AMBER' | 'RED' {
  if (acc >= 0.90) return 'BLUE';
  if (acc >= 0.80) return 'GREEN';
  if (acc >= 0.60) return 'AMBER';
  return 'RED';
}

function buildIdQuery(studentUserId: string) {
  const variants: object[] = [{ studentUserId: studentUserId }];
  if (mongoose.Types.ObjectId.isValid(studentUserId)) {
    variants.push({ studentUserId: new mongoose.Types.ObjectId(studentUserId) });
  }
  return { $or: variants };
}

// ── Main extractor ────────────────────────────────────────────────────────────

export async function getStudentData(studentUserId: string): Promise<StudentData | null> {
  await connectDB();

  const idQuery = buildIdQuery(studentUserId);

  // 1. Fetch scored evaluation
  const evaluation = await PriTestEvaluation.findOne(idQuery).sort({ createdAt: -1 }).lean() as any;
  if (!evaluation) return null;

  // 2. Fetch raw student response (for timing + per-question isCorrect)
  const rawResponse = await StudentResponse.findOne(idQuery).sort({ createdAt: -1 }).lean() as any;

  // 3. Build domain ID → name lookup
  const domainIdToName: Record<string, string> = {};
  for (const ds of (rawResponse?.domainSummaries || [])) {
    const did   = String(ds.domainId || '');
    const dname = ds.domainName || '';
    if (did && dname) domainIdToName[did] = dname;
  }
  for (const dom of (evaluation.domains || [])) {
    const did   = String(dom.domainId || '');
    const dname = dom.domainName || '';
    if (did && dname) domainIdToName[did] = dname;
  }

  // 4. Aggregate per-question isCorrect by domain + subSkill
  type QDetail = { subSkill: string; difficulty: string; timeTaken: number };
  const responseStats: Record<string, Record<string, {
    correctQs: QDetail[]; wrongQs: QDetail[]; times: number[];
  }>> = {};
  const domainCorrect: Record<string, number> = {};
  const domainTotal:   Record<string, number> = {};
  const ssTimeMap:     Record<string, number[]> = {};

  for (const r of (rawResponse?.responses || [])) {
    const did = String(r.domainId || 'unknown');
    const ss  = r.subSkill || 'Unknown';
    const t   = parseFloat(r.timeTakenSeconds || 0);

    if (!responseStats[did]) responseStats[did] = {};
    if (!responseStats[did][ss]) responseStats[did][ss] = { correctQs: [], wrongQs: [], times: [] };
    responseStats[did][ss].times.push(t);

    if (!domainTotal[did]) domainTotal[did] = 0;
    domainTotal[did]++;

    ssTimeMap[ss] = ssTimeMap[ss] || [];
    ssTimeMap[ss].push(t);

    const qDetail: QDetail = { subSkill: ss, difficulty: r.difficulty || 'unknown', timeTaken: t };

    if (r.isCorrect === true) {
      if (!domainCorrect[did]) domainCorrect[did] = 0;
      domainCorrect[did]++;
      responseStats[did][ss].correctQs.push(qDetail);
    } else if (r.isCorrect === false) {
      responseStats[did][ss].wrongQs.push(qDetail);
    }
  }

  // 5. Domain timing map from domainSummaries
  const domainTiming: Record<string, { timeSpentSec: number; scheduledDurSec: number }> = {};
  for (const ds of (rawResponse?.domainSummaries || [])) {
    domainTiming[ds.domainName || ''] = {
      timeSpentSec:    ds.timeSpentSeconds || 0,
      scheduledDurSec: ds.scheduledDurationSeconds || 0,
    };
  }

  // 6. Compute overall accuracy using isCorrect as source of truth
  const totalCorrectAll   = Object.values(domainCorrect).reduce((a, b) => a + b, 0);
  const definitiveQs      = (rawResponse?.responses || []).filter(
    (r: any) => r.isCorrect === true || r.isCorrect === false
  ).length;

  let overallPct: number;
  let overallScore: number;
  if (definitiveQs > 0) {
    overallPct   = totalCorrectAll / definitiveQs;
    overallScore = Math.round(overallPct * 100 * 10) / 10;
  } else {
    overallScore = evaluation.totalScore || 0;
    overallPct   = overallScore / 100;
  }

  // 7. Build per-domain aggregation
  const domainsOut: Record<string, DomainData> = {};

  for (const dom of (evaluation.domains || [])) {
    const domainName = dom.domainName;
    const domainId   = String(dom.domainId || '');

    const actualCorrect = domainCorrect[domainId] ?? 0;
    const actualTotal   = domainTotal[domainId]   ?? 0;

    const correct = actualTotal > 0 ? actualCorrect : (dom.correct || 0);
    const total   = actualTotal > 0 ? actualTotal   : (dom.total   || 1);

    const domainAcc   = correct / Math.max(total, 1);
    const timing      = domainTiming[domainName] || { timeSpentSec: 0, scheduledDurSec: 0 };
    const totalTime   = timing.timeSpentSec;
    const estTime     = timing.scheduledDurSec;
    const timeRatio   = estTime > 0 ? Math.round((totalTime / estTime) * 100) / 100 : 1.0;

    // Subskill breakdown
    const subSkillDetails: SubSkillDetail[] = [];
    const weakSS:   string[] = [];
    const strongSS: string[] = [];
    const domainResponseData = responseStats[domainId] || {};

    for (const ss of (dom.subskills || [])) {
      const ssName    = ss.name;
      const ssActual  = domainResponseData[ssName];
      const ssCorrect = ssActual ? ssActual.correctQs.length : (ss.correct || 0);
      const ssWrong   = ssActual ? ssActual.wrongQs.length   : 0;
      const ssTotal   = ssActual ? ssCorrect + ssWrong       : (ss.total || 1);
      const ssAcc     = Math.round((ssCorrect / Math.max(ssTotal, 1)) * 100);

      const ssTimes  = ssTimeMap[ssName] || [];
      const ssRatio  = (ssTimes.length && estTime)
        ? Math.round((ssTimes.reduce((a, b) => a + b, 0) / ssTimes.length) / (estTime / Math.max(total, 1)) * 100) / 100
        : timeRatio;

      subSkillDetails.push({ name: ssName, accuracy: ssAcc, avgTimeRatio: ssRatio, correct: ssCorrect, total: ssTotal });

      if (ssAcc < 50)  weakSS.push(ssName);
      if (ssAcc >= 75) strongSS.push(ssName);
    }

    // Correct/wrong question lists
    const correctQuestions: QDetail[] = [];
    const wrongQuestions:   QDetail[] = [];
    for (const [, ssData] of Object.entries(domainResponseData)) {
      correctQuestions.push(...ssData.correctQs);
      wrongQuestions.push(...ssData.wrongQs);
    }

    domainsOut[domainName] = {
      accuracy:           Math.round(domainAcc * 10000) / 10000,
      band:               bandFromAccuracy(domainAcc),
      questionsAttempted: total,
      correct,
      avgTimeRatio:       timeRatio,
      totalTimeSec:       Math.round(totalTime),
      estTimeSec:         Math.round(estTime),
      needsAttention:     total - correct,
      weakSubSkills:      weakSS,
      strongSubSkills:    strongSS,
      subSkillDetails,
      correctQuestions,
      wrongQuestions,
    };
  }

  // 8. Build user profile info
  const studentName     = rawResponse?.studentName     || '';
  const studentUsername = rawResponse?.studentUsername  || '';
  const studentIdCode   = rawResponse?.studentId        || studentUserId;
  const institutionId   = String(evaluation.institutionId || '');
  const examDate        = String(rawResponse?.testSubmittedAt || '').split('T')[0].split(' ')[0];

  return {
    studentId:       studentIdCode,
    studentUserId,
    studentName,
    studentUsername,
    batch:           institutionId,
    programme:       'MBA',
    priBand:         bandFromAccuracy(overallPct),
    overallAccuracy: Math.round(overallPct * 10000) / 10000,
    overallScore,
    examDate,
    domains:         domainsOut,
  };
}

// ── Faculty: get students by institution ──────────────────────────────────────

export async function getInstitutionStudentIds(institutionId: string): Promise<string[]> {
  await connectDB();

  const variants: object[] = [{ institutionId }];
  if (mongoose.Types.ObjectId.isValid(institutionId)) {
    variants.push({ institutionId: new mongoose.Types.ObjectId(institutionId) });
  }

  const docs = await PriTestEvaluation.find({ $or: variants }, { studentUserId: 1 }).lean();
  const ids  = [...new Set(docs.map((d: any) => String(d.studentUserId)).filter(Boolean))];
  return ids;
}

// ── Faculty: write-back insight to DB ─────────────────────────────────────────

// Lazy model for faculty_insights collection (not in main models)
function getFacultyInsightsModel() {
  if (mongoose.models.FacultyInsight) return mongoose.models.FacultyInsight;
  const schema = new mongoose.Schema({
    facultyId:     String,
    studentUserId: String,
    insightsData:  mongoose.Schema.Types.Mixed,
    generatedAt:   Date,
    updatedAt:     Date,
    createdAt:     Date,
  }, { collection: 'faculty_insights' });
  return mongoose.model('FacultyInsight', schema);
}

export async function saveFacultyInsight(
  facultyId:     string,
  studentUserId: string,
  payload:       object,
): Promise<void> {
  await connectDB();
  const Model = getFacultyInsightsModel();
  const now = new Date();
  await (Model as any).updateOne(
    { facultyId, studentUserId },
    {
      $set:       { facultyId, studentUserId, insightsData: payload, generatedAt: now, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
}

// ── UserAccount helper ────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<any | null> {
  await connectDB();
  return UserAccount.findById(userId).lean();
}
