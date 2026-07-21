import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import UserAccount from '@/models/UserAccount';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const adminUser = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    if (!adminUser.institutionId || !mongoose.Types.ObjectId.isValid(adminUser.institutionId)) {
      console.error('[GET /api/institution-admin/batches] Invalid institutionId:', adminUser.institutionId);
      return NextResponse.json({ error: 'Invalid institution context' }, { status: 400 });
    }

    const institutionId = new mongoose.Types.ObjectId(adminUser.institutionId);

    const [batches, studentCounts] = await Promise.all([
      Batch.find({ institutionId })
        .populate('assignedFaculty', 'fullName username')
        .sort({ createdAt: -1 })
        .lean(),
      UserAccount.aggregate([
        {
          $match: {
            institutionId,
            role: 'student',
            batch: { $exists: true, $ne: '' },
          },
        },
        { $group: { _id: '$batch', count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map<string, number>();
    for (const row of studentCounts) {
      if (row._id) {
        // Ensure _id is treated as a string for mapping against batch name
        const key = String(row._id);
        countMap.set(key, Number(row.count) || 0);
      }
    }

    const mapped = batches.map((batch) => ({
      ...batch,
      studentCount: countMap.get(batch.name) ?? 0,
    }));

    return NextResponse.json({ batches: mapped }, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/institution-admin/batches] Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  const adminUser = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const assignedFacultyRaw = Array.isArray(body.assignedFaculty) ? body.assignedFaculty : [];
  
  const assignedFaculty = assignedFacultyRaw
    .filter((id: any) => mongoose.Types.ObjectId.isValid(id))
    .map((id: any) => new mongoose.Types.ObjectId(id));

  if (!name) {
    return NextResponse.json({ error: 'Batch name is required' }, { status: 400 });
  }

  try {
    await connectDB();

    const institutionId = new mongoose.Types.ObjectId(adminUser.institutionId);
    const created = await Batch.create({
      institutionId,
      name,
      description: description || undefined,
      assignedFaculty,
      createdBy: adminUser.username,
      isActive: true,
    });

    return NextResponse.json({ batch: created.toJSON() }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: 'Batch name already exists' }, { status: 409 });
    }

    console.error('[POST /api/institution-admin/batches]', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}
