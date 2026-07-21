import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import PriTestBank from '@/models/PriTestBank';
import { getStudentFromAuthHeader } from '@/lib/auth';

/**
 * GET /api/student/pri-score
 * Lightweight: Returns only the last submitted PRI test score for this student + institution.
 * Used for the header badge display. Does not fetch questions or bank details.
 */
export async function GET(request: NextRequest) {
  const student = getStudentFromAuthHeader(request.headers.get('Authorization'));
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    // Fetch the most recent submitted PRI response for this student in this institution
    const lastResponse = await PriTestResponse.findOne({
      studentUserId: student.id,
      institutionId: student.institutionId,
      status: 'submitted',
    })
      .populate('questionBankId', 'title program')
      .sort({ submittedAt: -1 })
      .lean() as any;

    if (!lastResponse) {
      return NextResponse.json({ hasScore: false }, { status: 200 });
    }

    // Fetch evaluation if available
    const evaluation = await PriTestEvaluation.findOne({
      responseId: lastResponse._id,
    })
      .select('percentage mcqCorrect mcqTotal overallStatus evaluatedAt')
      .lean() as any;

    const bank = lastResponse.questionBankId as any;

    return NextResponse.json({
      hasScore: true,
      testTitle: bank?.title || 'PRI Readiness Test',
      testProgram: bank?.program || '',
      submittedAt: lastResponse.submittedAt,
      evaluation: evaluation
        ? {
            percentage: Math.round(evaluation.percentage ?? 0),
            mcqCorrect: evaluation.mcqCorrect ?? 0,
            mcqTotal: evaluation.mcqTotal ?? 0,
            overallStatus: evaluation.overallStatus ?? 'pending',
          }
        : null,
    });
  } catch (error) {
    console.error('[GET /api/student/pri-score]', error);
    return NextResponse.json({ error: 'Failed to fetch PRI score' }, { status: 500 });
  }
}
