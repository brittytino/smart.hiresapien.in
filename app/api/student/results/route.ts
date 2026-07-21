import '@/models/PriTestBank'; // Ensure model is registered for populate
import '@/models/UserAccount'; // Required ref
import '@/models/Institution'; // Required ref
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import PriTestBank from '@/models/PriTestBank';
import { getStudentFromAuthHeader } from '@/lib/auth';


/**
 * GET /api/student/results
 * Student: view own test results history.
 */


export async function GET(request: NextRequest) {
  const student = getStudentFromAuthHeader(request.headers.get('Authorization'));
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, institutionId } = student;

  try {
    await connectDB();

    // 1. Fetch submitted responses
    const attemptsRaw = await PriTestResponse.find({
      studentUserId: new mongoose.Types.ObjectId(id),
      institutionId: new mongoose.Types.ObjectId(institutionId),
      status: 'submitted',
    })
      .populate('questionBankId', 'title program institutions')
      .sort({ submittedAt: -1 })
      .lean();

    // 2. Map all attempts and include publication status
    const attempts = attemptsRaw.map(attempt => {
      const bank = attempt.questionBankId as any;
      const instShare = bank?.institutions?.find(
        (i: any) => i.institutionId.toString() === institutionId
      );
      
      return {
        ...attempt,
        isResultsPublished: Boolean(instShare?.isResultsPublished)
      };
    });

    // 3. Fetch evaluations for these responses
    const responseIds = attempts.map(a => a._id);
    const evaluations = await PriTestEvaluation.find({
      responseId: { $in: responseIds }
    }).lean();

    const evaluationMap = new Map(evaluations.map(e => [e.responseId.toString(), e]));

    // 4. Attach evaluations to attempts
    const finalAttempts = attempts.map(attempt => ({
      ...attempt,
      evaluation: evaluationMap.get(attempt._id.toString()) || null
    }));

    const summary = {
      totalAttempts: finalAttempts.length,
    };

    return NextResponse.json({ attempts: finalAttempts, summary }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/student/results]', error);
    return NextResponse.json({ error: 'Failed to fetch student results' }, { status: 500 });
  }
}
