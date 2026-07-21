import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Institution from '@/models/Institution';
import UserAccount from '@/models/UserAccount';
import { getAdminFromAuthHeader } from '@/lib/auth';

/**
 * GET /api/admin/institutions
 * Admin: list institutions and slot usage.
 */
export async function GET(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    const institutions = await Institution.find({}).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      institutions.map(async (institution) => {
        const [facultyCount, studentCount] = await Promise.all([
          UserAccount.countDocuments({ institutionId: institution._id, role: 'faculty' }),
          UserAccount.countDocuments({ institutionId: institution._id, role: 'student' }),
        ]);

        return {
          ...institution,
          slotUsage: {
            faculty: facultyCount,
            students: studentCount,
          },
        };
      })
    );

    return NextResponse.json({ institutions: enriched }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/institutions]', error);
    return NextResponse.json({ error: 'Failed to fetch institutions' }, { status: 500 });
  }
}

/**
 * POST /api/admin/institutions
 * Admin: create institution + institution admin account with slot limits.
 */
export async function POST(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const institutionName = typeof body.institutionName === 'string' ? body.institutionName.trim() : '';
  const institutionCode = typeof body.institutionCode === 'string' ? body.institutionCode.trim().toUpperCase() : '';
  const adminUsername = typeof body.adminUsername === 'string' ? body.adminUsername.trim() : '';
  const adminPassword = typeof body.adminPassword === 'string' ? body.adminPassword : '';
  const facultySlotLimit = typeof body.facultySlotLimit === 'number' ? body.facultySlotLimit : Number(body.facultySlotLimit ?? 0);
  const studentSlotLimit = typeof body.studentSlotLimit === 'number' ? body.studentSlotLimit : Number(body.studentSlotLimit ?? 0);

  if (!institutionName || !institutionCode || !adminUsername || !adminPassword) {
    return NextResponse.json({ error: 'institutionName, institutionCode, adminUsername and adminPassword are required' }, { status: 400 });
  }

  if (adminPassword.length < 6) {
    return NextResponse.json({ error: 'Institution admin password must be at least 6 characters' }, { status: 400 });
  }

  if (!Number.isFinite(facultySlotLimit) || facultySlotLimit < 0 || !Number.isFinite(studentSlotLimit) || studentSlotLimit < 0) {
    return NextResponse.json({ error: 'Slot limits must be non-negative numbers' }, { status: 400 });
  }

  try {
    await connectDB();

    const [existingCode, existingUsername] = await Promise.all([
      Institution.findOne({ code: institutionCode }),
      UserAccount.findOne({ username: adminUsername }),
    ]);

    if (existingCode) {
      return NextResponse.json({ error: 'Institution code already exists' }, { status: 409 });
    }

    if (existingUsername) {
      return NextResponse.json({ error: 'Institution admin username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const institutionId = new mongoose.Types.ObjectId();

    const institutionAdmin = await UserAccount.create({
      username: adminUsername,
      password: hashedPassword,
      role: 'institution_admin',
      institutionId,
      createdBy: admin.username,
      isActive: true,
      fullName: typeof body.adminFullName === 'string' ? body.adminFullName.trim() : undefined,
    });

    const institution = await Institution.create({
      _id: institutionId,
      name: institutionName,
      code: institutionCode,
      institutionAdminId: institutionAdmin._id,
      facultySlotLimit,
      studentSlotLimit,
      createdByAdmin: admin.username,
    });

    return NextResponse.json(
      {
        institution,
        institutionAdmin: institutionAdmin.toJSON(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: 'Duplicate data found. Please use unique values.' }, { status: 409 });
    }

    console.error('[POST /api/admin/institutions]', error);
    return NextResponse.json({ error: 'Failed to create institution' }, { status: 500 });
  }
}
