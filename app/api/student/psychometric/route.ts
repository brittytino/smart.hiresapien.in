import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PsychometricTestAssignment from '@/models/PsychometricTestAssignment';
import PsychometricResult from '@/models/PsychometricResult';
import { getStudentFromAuthHeader } from '@/lib/auth';
import { testData } from '@/lib/psychometric/questions';

export async function GET(request: NextRequest) {
  const student = getStudentFromAuthHeader(request.headers.get('Authorization'));
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const now = new Date();

    // 1. Check if the institution has an active psychometric test window
    const assignment = await PsychometricTestAssignment.findOne({
      institutionId: student.institutionId,
      status: 'accepted',
      examStartDate: { $lte: now },
      examEndDate: { $gte: now },
    }).lean();

    if (!assignment) {
      return NextResponse.json(
        { error: 'No active psychometric test available for your institution at this time.', code: 'NO_ACTIVE_TEST' },
        { status: 404 }
      );
    }

    // 2. Check if the student already started or completed the test
    const existingResult = await PsychometricResult.findOne({
      studentUserId: student.id,
      institutionId: student.institutionId,
    }).lean();

    if (existingResult) {
      if (existingResult.status === 'terminated') {
        return NextResponse.json(
          { error: 'Your test was terminated due to rules violation.', code: 'TEST_TERMINATED' },
          { status: 403 }
        );
      }
      
      // If submitted, return the results
      if (existingResult.status === 'submitted') {
        return NextResponse.json(
          { 
            status: 'submitted',
            scores: existingResult.scores,
            aiAnalysis: existingResult.aiAnalysis
          },
          { status: 200 }
        );
      }
    }

    // 3. Return the static test data (traits/questions) for them to start
    return NextResponse.json(
      {
        status: existingResult?.status || 'not_started',
        testData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/student/psychometric]', error);
    return NextResponse.json({ error: 'Failed to fetch psychometric test status' }, { status: 500 });
  }
}

// Optional: Route to terminate a test if cheating is detected
export async function PATCH(request: NextRequest) {
  const student = getStudentFromAuthHeader(request.headers.get('Authorization'));
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    
    await PsychometricResult.findOneAndUpdate(
      {
        studentUserId: student.id,
        institutionId: student.institutionId,
      },
      {
        $set: { status: 'terminated' },
        $inc: { violationCount: 1 }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/student/psychometric]', error);
    return NextResponse.json({ error: 'Failed to update test status' }, { status: 500 });
  }
}
