import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Contributor from '@/models/Contributor';
import { signContributorToken } from '@/lib/auth';

/**
 * POST /api/auth/contributor/login
 * Body: { username: string; password: string }
 */
export async function POST(request: NextRequest) {
  let body: { username?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { username, password } = body;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'username and password must be strings' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const contributor = await Contributor.findOne({ username: username.trim() }).select('+password');
    if (!contributor) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!contributor.isActive) {
      return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, contributor.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signContributorToken(contributor._id.toString(), contributor.username);

    return NextResponse.json(
      {
        token,
        role: 'contributor',
        contributor: contributor.toJSON(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/auth/contributor/login]', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
