/**
 * POST /api/insights/cache/clear
 * Body: { studentId?: string }  — omit to clear ALL student cache
 */
import { NextRequest, NextResponse } from 'next/server';
import { clearStudentCache } from '@/lib/ai/ai-router';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authHeader       = request.headers.get('Authorization');
  const admin            = getAdminFromAuthHeader(authHeader);
  const institutionAdmin = !admin ? getInstitutionAdminFromAuthHeader(authHeader) : null;

  if (!admin && !institutionAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body      = await request.json().catch(() => ({}));
  const studentId = body.studentId as string | undefined;

  clearStudentCache(studentId);

  return NextResponse.json({
    message: studentId
      ? `AI insight cache cleared for studentId=${studentId}`
      : 'AI insight cache cleared for all students',
  });
}
