import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import PsychometricTestAssignment from '@/models/PsychometricTestAssignment';
import PsychometricResult from '@/models/PsychometricResult';
import UserAccount from '@/models/UserAccount';
import { getStudentFromAuthHeader } from '@/lib/auth';
import { testData } from '@/lib/psychometric/questions';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  const student = getStudentFromAuthHeader(request.headers.get('Authorization'));
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { scores?: Record<string, number> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { scores } = body;
  if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
    return NextResponse.json({ error: 'Scores object is required' }, { status: 400 });
  }

  try {
    await connectDB();
    const now = new Date();

    // 1. Verify active assignment
    const assignment = await PsychometricTestAssignment.findOne({
      institutionId: student.institutionId,
      status: 'accepted',
      examStartDate: { $lte: now },
      examEndDate: { $gte: now },
    }).lean();

    if (!assignment) {
      return NextResponse.json(
        { error: 'No active psychometric test available for your institution.', code: 'NO_ACTIVE_TEST' },
        { status: 403 }
      );
    }

    // 2. Prevent re-submission or submission if terminated
    const existing = await PsychometricResult.findOne({
      studentUserId: student.id,
      institutionId: student.institutionId,
    }).lean();

    if (existing?.status === 'submitted') {
      return NextResponse.json({ error: 'Test already submitted' }, { status: 400 });
    }
    if (existing?.status === 'terminated') {
      return NextResponse.json({ error: 'Test was terminated' }, { status: 403 });
    }

    const studentAccount = await UserAccount.findById(student.id).lean();
    const studentName = studentAccount?.fullName ?? student.username;
    const studentId = studentAccount?.studentId;

    // 3. Real-time Evaluation Logic
    const traitResults: Record<string, { score: number; maxScore: number; passed: boolean }> = {};
    let passedTraitsCount = 0;

    testData.forEach((trait) => {
      const traitId = trait.id;
      const traitTitle = trait.title;
      const studentScore = scores[traitId] || 0;
      
      // Calculate max potential score for this trait
      // Each question in testData has a max score of 1.0 based on lib/psychometric/questions.ts
      const maxScore = trait.questions.length * 1.0; 
      const passed = studentScore >= (maxScore / 2);

      if (passed) passedTraitsCount++;

      traitResults[traitTitle] = {
        score: studentScore,
        maxScore: maxScore,
        passed: passed
      };
    });

    const overallStatus = passedTraitsCount >= 3 ? 'pass' : 'fail';
    const aiAnalysis = overallStatus === 'pass' 
      ? 'Evaluation complete. You have successfully cleared the behavioral gateway.' 
      : 'Evaluation complete. Your behavioral profile has been recorded.';

    // 4. Save results
    const result = await PsychometricResult.findOneAndUpdate(
      {
        studentUserId: new mongoose.Types.ObjectId(student.id),
        institutionId: new mongoose.Types.ObjectId(student.institutionId),
      },
      {
        $set: {
          scores,
          traitResults,
          overallStatus,
          passedTraitsCount,
          aiAnalysis,
          status: 'submitted',
          submittedAt: now,
          studentId,
          studentName,
          studentUsername: student.username,
        },
        $setOnInsert: {
          startedAt: now, // Ideally they hit a start endpoint earlier, but fallback to now
        }
      },
      { returnDocument: 'after', upsert: true }
    );

    return NextResponse.json(
      { success: true, aiAnalysis: result.aiAnalysis, scores: result.scores },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/student/psychometric/submit]', error);
    return NextResponse.json({ error: 'Failed to submit psychometric test' }, { status: 500 });
  }
}
