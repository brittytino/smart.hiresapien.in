import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import PriTestResponse from '@/models/PriTestResponse';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader } from '@/lib/auth';

/**
 * GET /api/admin/pri-tests/[id]/responses/[responseId]
 * Admin: fetch a specific student's response answers (including written task details).
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string; responseId: string } | Promise<{ id: string; responseId: string }> }
) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  const institutionAdmin = !admin ? getInstitutionAdminFromAuthHeader(request.headers.get('Authorization')) : null;
  if (!admin && !institutionAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: testId, responseId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(testId) || !mongoose.Types.ObjectId.isValid(responseId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await connectDB();

    const response = await PriTestResponse.findOne({
      _id: new mongoose.Types.ObjectId(responseId),
      questionBankId: new mongoose.Types.ObjectId(testId),
    }).lean();

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    return NextResponse.json({
      answers: response.answers || [],
      studentName: response.studentName,
      studentId: response.studentId,
      submittedAt: response.submittedAt,
    });
  } catch (error) {
    console.error('[GET /api/admin/pri-tests/[id]/responses/[responseId]]', error);
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 });
  }
}
