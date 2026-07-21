import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/auth';

/**
 * POST /api/auth/admin/login
 * Body: { username: string; password: string }
 *
 * Validates against ADMIN_USERNAME / ADMIN_PASSWORD env vars and returns
 * a signed JWT on success.
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

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  console.log('[Admin Login] ENV check — ADMIN_USERNAME loaded:', adminUsername ? `"${adminUsername}"` : 'NOT SET');
  console.log('[Admin Login] ENV check — ADMIN_PASSWORD loaded:', adminPassword ? '(set)' : 'NOT SET');
  console.log('[Admin Login] Received username:', `"${username}"`);

  if (!adminUsername || !adminPassword) {
    console.error('[Admin Login] ❌ ADMIN_USERNAME or ADMIN_PASSWORD is not configured in .env.local');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Validate credentials
  if (username !== adminUsername || password !== adminPassword) {
    console.warn('[Admin Login] ❌ Credentials mismatch — check .env.local matches what you typed');
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  console.log('[Admin Login] ✅ Credentials valid — issuing token for:', username);

  const token = signAdminToken(username);

  return NextResponse.json({ token, role: 'admin' }, { status: 200 });
}
