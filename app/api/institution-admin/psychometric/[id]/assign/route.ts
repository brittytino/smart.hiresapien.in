import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PsychometricTestAssignment from '@/models/PsychometricTestAssignment';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

/**
 * POST /api/institution-admin/psychometric/[id]/assign
 * Accept or reject a psychometric test assigned by the Global Admin.
 * Body: { status: 'accepted' | 'rejected', examStartDate?: Date, examEndDate?: Date }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // In Next.js App Router, params is a Promise
) {
  const user = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const assignmentId = resolvedParams.id;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { status, examStartDate, examEndDate } = body;
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Valid status (accepted/rejected) is required.' }, { status: 400 });
  }

  try {
    await connectDB();

    const assignment = await PsychometricTestAssignment.findOne({
      _id: assignmentId,
      institutionId: user.institutionId,
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    assignment.status = status as 'accepted' | 'rejected';
    assignment.respondedAt = new Date();

    if (status === 'accepted') {
      if (examStartDate) assignment.examStartDate = new Date(examStartDate);
      if (examEndDate) assignment.examEndDate = new Date(examEndDate);
      // Validate dates
      if (assignment.examStartDate > assignment.examEndDate) {
        return NextResponse.json({ error: 'Start date cannot be after end date.' }, { status: 400 });
      }
    }

    await assignment.save();

    return NextResponse.json({ message: 'Assignment updated successfully', assignment }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/institution-admin/psychometric/[id]/assign]', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}
