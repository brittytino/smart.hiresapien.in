import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Contributor from '@/models/Contributor';
import { getAdminFromAuthHeader } from '@/lib/auth';

/**
 * GET /api/contributors
 * Returns all contributors (password excluded).
 * Requires: Authorization: Bearer <adminToken>
 */
export async function GET(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const contributors = await Contributor.find({}).sort({ createdAt: -1 }).lean();
    const safeContributors = contributors.map((contributor) => {
      const { password: _password, ...safe } = contributor as typeof contributor & { password?: string };
      void _password;
      return safe;
    });
    return NextResponse.json({ contributors: safeContributors }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/contributors]', error);
    return NextResponse.json({ error: 'Failed to fetch contributors' }, { status: 500 });
  }
}

/**
 * POST /api/contributors
 * Creates a new contributor.
 * Body: { username: string; password: string; email?: string; displayName?: string }
 * Requires: Authorization: Bearer <adminToken>
 */
export async function POST(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { username?: unknown; password?: unknown; email?: unknown; displayName?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { username, password, email, displayName } = body;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'username and password are required strings' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const existing = await Contributor.findOne({ username: username.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const contributor = await Contributor.create({
      username: username.trim(),
      password: hashedPassword,
      ...(typeof email === 'string' && email ? { email } : {}),
      ...(typeof displayName === 'string' && displayName ? { displayName } : {}),
    });

    // toJSON strips password field via transformer in the model
    return NextResponse.json({ contributor: contributor.toJSON() }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    console.error('[POST /api/contributors]', error);
    return NextResponse.json({ error: 'Failed to create contributor' }, { status: 500 });
  }
}
