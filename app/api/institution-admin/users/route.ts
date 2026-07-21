import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Institution from '@/models/Institution';
import UserAccount from '@/models/UserAccount';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import Batch from '@/models/Batch';

function normalizeRole(input: string | null): 'faculty' | 'student' | null {
  if (input === 'faculty' || input === 'student') return input;
  return null;
}

export async function GET(request: NextRequest) {
  const adminUser = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = normalizeRole(searchParams.get('role'));

  if (!role && searchParams.has('role')) {
    return NextResponse.json({ users: [] }, { status: 200 });
  }

  try {
    await connectDB();
    
    // Explicitly convert institutionId to ObjectId to ensure query consistency
    const instIdObj = new mongoose.Types.ObjectId(adminUser.institutionId);
    
    const filter: any = { institutionId: instIdObj };
    if (role) {
      filter.role = role;
    } else {
      filter.role = { $in: ['faculty', 'student'] };
    }
    
    const users = await UserAccount.find(filter).sort({ createdAt: -1 }).lean();

    if (role === 'student') {
      const enrichedUsers = await Promise.all(users.map(async (u: any) => {
        try {
          const latestEval = await PriTestEvaluation.findOne({ studentUserId: u._id })
            .sort({ evaluatedAt: -1 })
            .lean() as any;
          
          if (latestEval) {
            // Get top 3 domain scores for skill split
            const skillSplit = (latestEval.domains || [])
              .filter((dom: any) => dom && dom.domainName) // Defensive check
              .map((dom: any) => {
                let pct = 0;
                try {
                  if (dom.domainShare > 0 && dom.score !== undefined) {
                    pct = (dom.score / dom.domainShare) * 100;
                  } else if (dom.total > 0) {
                    pct = (dom.correct / dom.total) * 100;
                  }
                } catch (e) {
                  console.error(`[GET /api/institution-admin/users] Error calculating pct for dom ${dom?.domainName}:`, e);
                }
                return {
                  name: dom.domainName || 'Domain',
                  score: pct || 0
                };
              });

            return {
              ...u,
              latestPriScore: latestEval.percentage || 0,
              readinessBand: latestEval.overallStatus || 'pending',
              skillSplit: skillSplit.length > 0 ? skillSplit : []
            };
          }
        } catch (e) {
          console.error(`[GET /api/institution-admin/users] Error enriching user ${u._id}:`, e);
        }
        
        return {
          ...u,
          latestPriScore: 0,
          readinessBand: 'none',
          skillSplit: []
        };
      }));
      return NextResponse.json({ users: enrichedUsers }, { status: 200 });
    }

    if (role === 'faculty') {
      const enrichedFaculty = await Promise.all(users.map(async (u: any) => {
        try {
          const batches = await Batch.find({ 
            assignedFaculty: u._id,
            institutionId: instIdObj
          }).select('name').lean();
          
          return {
            ...u,
            batch: batches.map(b => b.name).join(', ')
          };
        } catch (e) {
          console.error(`[GET /api/institution-admin/users] Error enriching faculty ${u._id}:`, e);
          return u;
        }
      }));
      return NextResponse.json({ users: enrichedFaculty }, { status: 200 });
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/institution-admin/users]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  const adminUser = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const role = typeof body.role === 'string' ? normalizeRole(body.role) : null;
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const studentId = typeof body.studentId === 'string' ? body.studentId.trim().toUpperCase() : '';
  const batch = typeof body.batch === 'string' ? body.batch.trim() : '';

  if (!role || !username || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (role === 'student' && !studentId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    await connectDB();
    const inst = await Institution.findById(adminUser.institutionId);
    if (!inst) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const currentRoleCount = await UserAccount.countDocuments({
      institutionId: adminUser.institutionId,
      role,
    });

    if (role === 'faculty' && currentRoleCount >= inst.facultySlotLimit) {
      return NextResponse.json({ error: 'Faculty slot limit reached' }, { status: 403 });
    }

    if (role === 'student' && currentRoleCount >= inst.studentSlotLimit) {
      return NextResponse.json({ error: 'Student slot limit reached' }, { status: 403 });
    }

    const existing = await UserAccount.findOne({ username });
    if (existing) return NextResponse.json({ error: 'Exists' }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const createPayload: Record<string, unknown> = {
      username,
      password: hashedPassword,
      role,
      institutionId: adminUser.institutionId,
      fullName,
      isActive: true,
      createdBy: adminUser.username
    };

    if (role === 'student') {
      createPayload.studentId = studentId;
      if (batch) {
        createPayload.batch = batch;
      }
    }

    const created = await UserAccount.create(createPayload);

    return NextResponse.json({ user: created.toJSON() }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: 'Username or student ID already exists' }, { status: 409 });
    }

    console.error('[POST /api/institution-admin/users]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
