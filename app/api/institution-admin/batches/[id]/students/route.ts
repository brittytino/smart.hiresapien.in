import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import UserAccount from '@/models/UserAccount';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/institution-admin/batches/[id]/students
 * Body: { studentId: string, action: "add" | "remove" }
 *
 * Rules:
 *  - "add": student must have no batch assigned yet (one-batch-only constraint).
 *  - "remove": clears the student's batch field.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const adminUser = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid batch ID' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const studentUserId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
  const action = body.action === 'add' || body.action === 'remove' ? body.action : null;

  if (!studentUserId || !action) {
    return NextResponse.json({ error: 'studentId and action ("add" | "remove") are required' }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(studentUserId)) {
    return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
  }

  try {
    await connectDB();

    const institutionId = new mongoose.Types.ObjectId(adminUser.institutionId);

    // Verify the batch belongs to this institution
    const batch = await Batch.findOne({ _id: id, institutionId });
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Verify the student belongs to this institution
    const student = await UserAccount.findOne({
      _id: studentUserId,
      institutionId,
      role: 'student',
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (action === 'add') {
      // Enforce one-batch-only: if the student already has a batch assigned, reject
      if (student.batch && student.batch.trim() !== '') {
        return NextResponse.json(
          {
            error: `Student is already assigned to batch "${student.batch}". Remove them from that batch first.`,
          },
          { status: 409 }
        );
      }

      student.batch = batch.name;
      await student.save();

      return NextResponse.json(
        { message: `Student added to batch "${batch.name}" successfully.` },
        { status: 200 }
      );
    }

    // action === 'remove'
    student.batch = undefined;
    await student.save();

    return NextResponse.json(
      { message: `Student removed from batch "${batch.name}" successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/institution-admin/batches/[id]/students]', error);
    return NextResponse.json({ error: 'Failed to update student batch assignment' }, { status: 500 });
  }
}
