import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Contributor from '@/models/Contributor';
import UserAccount from '@/models/UserAccount';
import {
  signAdminToken,
  signContributorToken,
  signFacultyToken,
  signInstitutionAdminToken,
  signStudentToken,
} from '@/lib/auth';


/**
 * POST /api/auth/login
 * Body: { username: string; password: string }
 * 
 * Automatically determines role:
 * 1. Admin (via env vars)
 * 2. Institution users (institution admin, faculty, student)
 * 3. Contributor (via MongoDB)
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

  const trimmedUsername = username.trim();

  // 1. Check Admin (env vars)
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminUsername && adminPassword && trimmedUsername === adminUsername && password === adminPassword) {
    const token = signAdminToken(trimmedUsername);
    return NextResponse.json({ 
      token, 
      role: 'admin',
      redirect: '/admin' 
    }, { status: 200 });
  }

  // 2. Check institution users (DB)
  try {
    await connectDB();

    const appUser = await UserAccount.findOne({ username: trimmedUsername }).select('+password');
    if (appUser) {
      if (!appUser.isActive) {
        return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
      }

      const isMatch = await bcrypt.compare(password, appUser.password);
      if (isMatch) {
        if (!appUser.institutionId) {
          return NextResponse.json({ error: 'Institution is not linked to this account' }, { status: 400 });
        }

        const institutionId = appUser.institutionId.toString();

        if (appUser.role === 'institution_admin') {
          const token = signInstitutionAdminToken(
            appUser._id.toString(),
            appUser.username,
            institutionId
          );
          return NextResponse.json(
            {
              token,
              role: 'institution_admin',
              redirect: '/institution-admin',
              user: appUser.toJSON(),
            },
            { status: 200 }
          );
        }

        if (appUser.role === 'faculty') {
          const token = signFacultyToken(appUser._id.toString(), appUser.username, institutionId);
          return NextResponse.json(
            {
              token,
              role: 'faculty',
              redirect: '/faculty',
              user: appUser.toJSON(),
            },
            { status: 200 }
          );
        }

        if (appUser.role === 'student') {
          const token = signStudentToken(appUser._id.toString(), appUser.username, institutionId);
          return NextResponse.json(
            {
              token,
              role: 'student',
              redirect: '/student',
              user: appUser.toJSON(),
            },
            { status: 200 }
          );
        }
      }
    }

    // 3. Check Contributor (DB)
    const contributor = await Contributor.findOne({ username: trimmedUsername }).select('+password');
    if (contributor) {
      if (!contributor.isActive) {
        return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
      }

      const isMatch = await bcrypt.compare(password, contributor.password);
      if (isMatch) {
        const token = signContributorToken(contributor._id.toString(), contributor.username);
        return NextResponse.json(
          {
            token,
            role: 'contributor',
            redirect: '/contributor/dashboard',
            contributor: contributor.toJSON(),
          },
          { status: 200 }
        );
      }
    }
  } catch (err) {
    console.error('[POST /api/auth/login] User lookup error:', err);
  }

  // 4. Fail
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
