import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

/**
 * POST /api/institution-admin/pri-tests/:id/respond
 * Body: { action: 'accept' | 'reject' }
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const user = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = body.action === 'accept' ? 'accepted' : body.action === 'reject' ? 'rejected' : null;
  if (!action) {
    return NextResponse.json({ error: 'action must be accept or reject' }, { status: 400 });
  }

  try {
    await connectDB();

    const bank = await QuestionBank.findById(id);
    if (!bank) return NextResponse.json({ error: 'Question bank not found' }, { status: 404 });

    const share = bank.institutions.find(
      (entry) => String(entry.institutionId) === String(user.institutionId)
    );

    if (!share) {
      return NextResponse.json({ error: 'Question bank not shared with this institution' }, { status: 404 });
    }

    share.status = action;
    share.respondedAt = new Date();

    await bank.save();

    // Also update PriTestBank
    const priBank = await PriTestBank.findById(id);
    if (priBank) {
      const priShare = priBank.institutions.find(
        (entry: any) => String(entry.institutionId) === String(user.institutionId)
      );
      if (priShare) {
        priShare.status = action;
        priShare.respondedAt = new Date();
        await priBank.save();
      }
    }

    return NextResponse.json({ bankId: bank._id, status: action }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/institution-admin/pri-tests/:id/respond]', error);
    return NextResponse.json({ error: 'Failed to update PRI test status' }, { status: 500 });
  }
}
