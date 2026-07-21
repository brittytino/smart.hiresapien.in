/**
 * POST /api/faculty/[facultyId]/cache/clear
 * Body: { studentId?: string } — omit to clear all students for this faculty
 */
import { NextRequest, NextResponse } from 'next/server';
import { clearFacultyCache } from '@/lib/ai/ai-router';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: { facultyId: string } | Promise<{ facultyId: string }> }
) {
  const { facultyId } = await context.params;

  const authHeader       = request.headers.get('Authorization');
  const admin            = getAdminFromAuthHeader(authHeader);
  const institutionAdmin = !admin ? getInstitutionAdminFromAuthHeader(authHeader) : null;

  if (!admin && !institutionAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body      = await request.json().catch(() => ({}));
  const studentId = body.studentId as string | undefined;

  clearFacultyCache(facultyId, studentId);

  return NextResponse.json({
    message: studentId
      ? `AI insight cache cleared for studentId=${studentId} under facultyId=${facultyId}`
      : `AI insight cache cleared for all students of facultyId=${facultyId}`,
  });
}
