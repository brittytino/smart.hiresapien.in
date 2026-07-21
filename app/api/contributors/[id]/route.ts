import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Contributor from '@/models/Contributor';
import { getAdminFromAuthHeader } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /api/contributors/[id]
 * Returns a single contributor by ID (password excluded).
 * Requires: Authorization: Bearer <adminToken>
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid contributor ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const contributor = await Contributor.findById(id).lean();
    if (!contributor) {
      return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
    }
    // Remove password from lean result
    const { password: _pw, ...safeContributor } = contributor as typeof contributor & { password: string };
    void _pw;
    return NextResponse.json({ contributor: safeContributor }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/contributors/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch contributor' }, { status: 500 });
  }
}

/**
 * PUT /api/contributors/[id]
 * Updates a contributor. Password is re-hashed if provided.
 * Body: { username?: string; password?: string; email?: string; displayName?: string; isActive?: boolean }
 * Requires: Authorization: Bearer <adminToken>
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid contributor ID' }, { status: 400 });
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
  if (typeof body.email === 'string') {
    updates.email = body.email.trim();
  }
  if (typeof body.displayName === 'string') {
    updates.displayName = body.displayName.trim();
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
    const contributor = await Contributor.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    if (!contributor) {
      return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
    }

    return NextResponse.json({ contributor: contributor.toJSON() }, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    console.error('[PUT /api/contributors/[id]]', error);
    return NextResponse.json({ error: 'Failed to update contributor' }, { status: 500 });
  }
}

/**
 * DELETE /api/contributors/[id]
 * Permanently deletes a contributor.
 * Requires: Authorization: Bearer <adminToken>
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid contributor ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const contributor = await Contributor.findByIdAndDelete(id);
    if (!contributor) {
      return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Contributor deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/contributors/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete contributor' }, { status: 500 });
  }
}
