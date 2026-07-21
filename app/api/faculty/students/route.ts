import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import PriTestResponse from '@/models/PriTestResponse';
import { getFacultyFromAuthHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const faculty = getFacultyFromAuthHeader(request.headers.get('Authorization'));
  if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const selectedBatch = searchParams.get('batch');

  try {
    await connectDB();

    const facultyUser = await UserAccount.findById(faculty.id).lean();
    if (!facultyUser) return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });

    // Use selectedBatch if provided, otherwise fallback to all assigned batches
    const assignedBatches = selectedBatch 
      ? [selectedBatch]
      : (facultyUser.batch ? facultyUser.batch.split(',').map((b: string) => b.trim()).filter(Boolean) : []);

    const students = await UserAccount.find({
      institutionId: faculty.institutionId,
      role: 'student',
      ...(assignedBatches.length > 0 ? { batch: { $in: assignedBatches } } : {}),
    })
      .select('_id username fullName studentId batch')
      .lean();

    const studentIds = students.map((student) => student._id);

    const latestResponses = await PriTestResponse.aggregate([
      {
        $match: {
          institutionId: new mongoose.Types.ObjectId(faculty.institutionId),
          status: 'submitted',
          studentUserId: { $in: studentIds },
        },
      },
      { $sort: { submittedAt: -1 } },
      {
        $group: {
          _id: '$studentUserId',
          responseId: { $first: '$_id' },
          submittedAt: { $first: '$submittedAt' },
          batch: { $first: '$batch' },
          programme: { $first: '$programme' },
        },
      },
      {
        $lookup: {
          from: 'pri_test_evaluations',
          localField: 'responseId',
          foreignField: 'responseId',
          as: 'evaluation',
        },
      },
      {
        $addFields: {
          evaluation: { $arrayElemAt: ['$evaluation', 0] },
        },
      },
      {
        $project: {
          responseId: 1,
          submittedAt: 1,
          batch: 1,
          programme: 1,
          evaluation: {
            responseId: '$responseId',
            percentage: '$evaluation.percentage',
            totalScore: '$evaluation.totalScore',
            mcqCorrect: '$evaluation.mcqCorrect',
            mcqTotal: '$evaluation.mcqTotal',
            overallStatus: '$evaluation.overallStatus',
            evaluatedAt: '$evaluation.evaluatedAt',
            domains: '$evaluation.domains',
            hasAiInsights: {
              $cond: [{ $ifNull: ['$evaluation.aiInsights', false] }, true, false],
            },
            priGatewayPassed: '$evaluation.priGatewayPassed',
          },
        },
      },
    ]);

    const latestByStudent = new Map(
      latestResponses.map((entry) => [String(entry._id), entry])
    );

    const studentRows = students.map((student) => {
      const latest = latestByStudent.get(String(student._id));
      return {
        id: String(student._id),
        username: student.username,
        fullName: student.fullName,
        studentId: student.studentId,
        batch: latest?.batch,
        programme: latest?.programme,
        latestEvaluation: latest?.evaluation || null,
      };
    });

    return NextResponse.json({ students: studentRows }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/faculty/students]', error);
    return NextResponse.json({ error: 'Failed to load students' }, { status: 500 });
  }
}
