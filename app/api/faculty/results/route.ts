import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import PriTestResponse from '@/models/PriTestResponse';
import { getFacultyFromAuthHeader } from '@/lib/auth';

/**
 * GET /api/faculty/results
 * Faculty: monitor students results + analysis for own institution.
 */
export async function GET(request: NextRequest) {
  const faculty = getFacultyFromAuthHeader(request.headers.get('Authorization'));
  if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const studentUserId = searchParams.get('studentUserId');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  try {
    await connectDB();

    const students = await UserAccount.find({
      institutionId: faculty.institutionId,
      role: 'student',
    })
      .select('_id username studentId fullName')
      .lean();

    const studentIds = students.map((s) => s._id);

    const filter: Record<string, unknown> = {
      institutionId: new mongoose.Types.ObjectId(faculty.institutionId),
      studentUserId: {
        $in: studentIds,
      },
    };

    if (studentUserId) {
      if (!mongoose.Types.ObjectId.isValid(studentUserId)) {
        return NextResponse.json({ error: 'Invalid studentUserId' }, { status: 400 });
      }
      filter.studentUserId = new mongoose.Types.ObjectId(studentUserId);
    }

    if (fromDate || toDate) {
      const dateRange: { $gte?: Date; $lte?: Date } = {};

      if (fromDate) {
        const parsedFrom = new Date(fromDate);
        if (Number.isNaN(parsedFrom.getTime())) {
          return NextResponse.json({ error: 'Invalid fromDate. Use YYYY-MM-DD' }, { status: 400 });
        }
        dateRange.$gte = parsedFrom;
      }

      if (toDate) {
        const parsedTo = new Date(toDate);
        if (Number.isNaN(parsedTo.getTime())) {
          return NextResponse.json({ error: 'Invalid toDate. Use YYYY-MM-DD' }, { status: 400 });
        }
        parsedTo.setHours(23, 59, 59, 999);
        dateRange.$lte = parsedTo;
      }

      filter.submittedAt = dateRange;
    }

    filter.status = 'submitted'; // Only evaluated/completed test responses

    const attempts = await PriTestResponse.aggregate([
      { $match: filter },
      { $sort: { submittedAt: -1 } },
      {
        $lookup: {
          from: 'pri_test_evaluations',
          localField: '_id',
          foreignField: 'responseId',
          as: 'evaluationData'
        }
      }
    ]);

    const studentMap = new Map(students.map((s) => [String(s._id), s]));

    const rows = attempts.map((attempt) => {
      const student = studentMap.get(String(attempt.studentUserId));
      const evaluation = attempt.evaluationData?.[0];
      return {
        _id: String(attempt._id),
        percentage: evaluation?.percentage || 0,
        score: evaluation?.totalScore || 0,
        totalQuestions: evaluation?.mcqTotal || 0,
        submittedAt: attempt.submittedAt,
        batch: attempt.batch || 'Batch 1',
        programme: attempt.programme || 'Unknown Course',
        domains: evaluation?.domains || [],
        student: student
          ? {
              id: String(student._id),
              username: student.username,
              fullName: student.fullName,
              studentId: student.studentId,
            }
          : null,
      };
    });

    const totalAttempts = attempts.length;
    const averagePercentage =
      totalAttempts > 0
        ? Number((attempts.reduce((acc, attempt) => acc + attempt.percentage, 0) / totalAttempts).toFixed(2))
        : 0;
    const passedAttempts = attempts.filter((a) => a.percentage >= 50).length;

    return NextResponse.json(
      {
        students: students.map((student) => ({
          id: String(student._id),
          username: student.username,
          fullName: student.fullName,
          studentId: student.studentId,
        })),
        results: rows,
        analysis: {
          totalAttempts,
          averagePercentage,
          passRate: totalAttempts > 0 ? Number(((passedAttempts / totalAttempts) * 100).toFixed(2)) : 0,
        },
        filters: {
          studentUserId: studentUserId ?? '',
          fromDate: fromDate ?? '',
          toDate: toDate ?? '',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/faculty/results]', error);
    return NextResponse.json({ error: 'Failed to fetch faculty results' }, { status: 500 });
  }
}
