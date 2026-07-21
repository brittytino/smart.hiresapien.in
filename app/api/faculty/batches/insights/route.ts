import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import UserAccount from '@/models/UserAccount';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import BatchInsight from '@/models/BatchInsight';
import { getFacultyFromAuthHeader } from '@/lib/auth';

type BatchStatus = 'generated' | 'skipped_threshold' | 'failed' | 'not_generated';

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

export async function GET(request: NextRequest) {
  const faculty = getFacultyFromAuthHeader(request.headers.get('Authorization'));
  if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    const institutionObjectId = new mongoose.Types.ObjectId(faculty.institutionId);
    const facultyObjectId = new mongoose.Types.ObjectId(faculty.id);

    // 1. Get batches assigned to this faculty
    const batches = await Batch.find({ 
      institutionId: institutionObjectId,
      assignedFaculty: facultyObjectId
    }).sort({ createdAt: -1 }).lean();

    if (batches.length === 0) {
      return NextResponse.json({ batches: [], message: 'No batches assigned to you yet.' });
    }

    const batchNames = batches.map((batch: any) => batch.name);
    
    // 2. Load stored AI insights for these batches
    const storedInsightsDocs = await BatchInsight.find({
      institutionId: institutionObjectId,
      batchKey: { $in: batchNames.map(normalizeBatchKey) },
    }).lean();
    const storedInsights = new Map(storedInsightsDocs.map((doc: any) => [String(doc.batchKey), doc]));

    // 3. Get students in these batches
    const students = await UserAccount.find({
      institutionId: institutionObjectId,
      role: 'student',
      batch: { $in: batchNames },
    })
      .select('_id username fullName studentId batch programme')
      .lean();

    const studentIds = students.map((s: any) => s._id);

    // 4. Get latest evaluations for these students
    const evaluations = studentIds.length
      ? await PriTestEvaluation.aggregate([
          {
            $match: {
              institutionId: institutionObjectId,
              studentUserId: { $in: studentIds },
              status: 'completed',
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

    const evaluationMap = new Map(evaluations.map((entry: any) => [String(entry._id), entry.evaluation]));

    // 5. Build output matching BatchInsights UI expectations
    const batchesOutput = batches.map((batch: any) => {
      const batchKey = normalizeBatchKey(batch.name);
      const stored = storedInsights.get(batchKey) as any;
      
      const batchStudents = students.filter((s: any) => s.batch === batch.name);
      const studentsWithEvals = batchStudents.map((s: any) => {
        const latest = evaluationMap.get(String(s._id));
        return {
          id: String(s._id),
          username: s.username,
          fullName: s.fullName,
          studentId: s.studentId,
          batch: s.batch,
          programme: s.programme,
          latestEvaluation: latest ? {
            responseId: String(latest.responseId),
            percentage: latest.percentage,
            overallStatus: latest.overallStatus,
            evaluatedAt: latest.evaluatedAt || latest.createdAt,
            domains: latest.domains,
          } : null
        };
      });

      const evaluatedCount = studentsWithEvals.filter(s => s.latestEvaluation).length;
      const averageScore = evaluatedCount > 0 
        ? roundPercent(studentsWithEvals.reduce((acc, s) => acc + (s.latestEvaluation?.percentage || 0), 0) / evaluatedCount)
        : 0;

      const passCount = studentsWithEvals.filter(s => s.latestEvaluation?.overallStatus === 'pass').length;
      const passRate = evaluatedCount > 0 ? roundPercent((passCount / evaluatedCount) * 100) : 0;

      return {
        batchName: batch.name,
        totalStudents: batchStudents.length,
        evaluatedStudents: evaluatedCount,
        averageScore,
        passRate,
        aiInsightStatus: stored ? 'generated' : 'not_generated',
        aiGeneratedAt: stored?.generatedAt,
        aiProvider: stored?.provider,
        aiInsights: stored?.aiInsights || null,
        batchMetrics: stored?.batchMetrics || {
          weakDomains: [],
          urgentStudents: [],
          topSubskillGaps: []
        },
        students: studentsWithEvals
      };
    });

    return NextResponse.json({
      batches: batchesOutput
    });

  } catch (error) {
    console.error('[GET /api/faculty/batches/insights]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
