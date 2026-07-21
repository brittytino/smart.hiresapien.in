import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import UserAccount from '@/models/UserAccount';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
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

  const nextName = typeof body.name === 'string' ? body.name.trim() : '';
  const nextDescription = typeof body.description === 'string' ? body.description.trim() : '';
  const nextIsActive = typeof body.isActive === 'boolean' ? body.isActive : undefined;
  const assignedFacultyRaw = Array.isArray(body.assignedFaculty) ? body.assignedFaculty : undefined;

  if (!nextName) {
    return NextResponse.json({ error: 'Batch name is required' }, { status: 400 });
  }

  try {
    await connectDB();

    const institutionId = new mongoose.Types.ObjectId(adminUser.institutionId);
    const existing = await Batch.findOne({ _id: id, institutionId });
    if (!existing) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const oldName = existing.name;
    existing.name = nextName;
    existing.description = nextDescription || undefined;
    if (typeof nextIsActive === 'boolean') {
      existing.isActive = nextIsActive;
    }

    if (assignedFacultyRaw !== undefined) {
      existing.assignedFaculty = assignedFacultyRaw
        .filter((fid: any) => mongoose.Types.ObjectId.isValid(fid))
        .map((fid: any) => new mongoose.Types.ObjectId(fid));
    }

    await existing.save();

    if (oldName !== nextName) {
      await UserAccount.updateMany(
        {
          institutionId,
          role: 'student',
          batch: oldName,
        },
        { $set: { batch: nextName } }
      );
    }

    return NextResponse.json({ batch: existing.toJSON() }, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: 'Batch name already exists' }, { status: 409 });
    }

    console.error('[PUT /api/institution-admin/batches/[id]]', error);
    return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const adminUser = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid batch ID' }, { status: 400 });
  }

  try {
    await connectDB();

    const institutionId = new mongoose.Types.ObjectId(adminUser.institutionId);
    const deleted = await Batch.findOneAndDelete({ _id: id, institutionId });

    if (!deleted) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    await UserAccount.updateMany(
      {
        institutionId,
        role: 'student',
        batch: deleted.name,
      },
      { $unset: { batch: '' } }
    );

    return NextResponse.json({ message: 'Batch deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/institution-admin/batches/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
  }
}
