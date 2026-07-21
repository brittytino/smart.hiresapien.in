import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PsychometricTestAssignment from '@/models/PsychometricTestAssignment';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

/**
 * GET /api/institution-admin/psychometric
 * Fetch the psychometric test assignment for this institution
 */
export async function GET(request: NextRequest) {
  const user = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    const assignment = await PsychometricTestAssignment.findOne({
      institutionId: user.institutionId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ assignment }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/institution-admin/psychometric]', error);
    return NextResponse.json({ error: 'Failed to fetch psychometric assignment' }, { status: 500 });
  }
}
