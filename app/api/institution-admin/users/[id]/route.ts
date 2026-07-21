import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/institution-admin/users/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const user = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const targetUser = await UserAccount.findOne({
      _id: id,
      institutionId: user.institutionId,
      role: { $in: ['faculty', 'student'] },
    }).lean();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: targetUser }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/institution-admin/users/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

/**
 * PUT /api/institution-admin/users/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const user = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.username === 'string' && body.username.trim()) {
    updates.username = body.username.trim();
  }
  if (typeof body.fullName === 'string') {
    updates.fullName = body.fullName.trim();
  }
  if (typeof body.studentId === 'string' && body.studentId.trim()) {
    updates.studentId = body.studentId.trim().toUpperCase();
  }
  if (typeof body.batch === 'string') {
    const batch = body.batch.trim();
    updates.batch = batch || undefined;
  }
  if (typeof body.isActive === 'boolean') {
    updates.isActive = body.isActive;
  }
  if (typeof body.password === 'string' && body.password.length >= 6) {
    updates.password = await bcrypt.hash(body.password, 12);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    await connectDB();

    const existing = await UserAccount.findOne({
      _id: id,
      institutionId: user.institutionId,
      role: { $in: ['faculty', 'student'] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await UserAccount.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    return NextResponse.json({ user: updated?.toJSON() }, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: 'Username or student ID already exists' }, { status: 409 });
    }

    console.error('[PUT /api/institution-admin/users/[id]]', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

/**
 * DELETE /api/institution-admin/users/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const deleted = await UserAccount.findOneAndDelete({
      _id: id,
      institutionId: user.institutionId,
      role: { $in: ['faculty', 'student'] },
    });

    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/institution-admin/users/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
