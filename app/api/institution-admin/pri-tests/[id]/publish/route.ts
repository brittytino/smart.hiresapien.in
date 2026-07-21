import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

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

  if (typeof body.publish !== 'boolean') {
    return NextResponse.json({ error: 'publish boolean required' }, { status: 400 });
  }

  try {
    await connectDB();

    const bank = await QuestionBank.findById(id);
    if (!bank) return NextResponse.json({ error: 'Question bank not found' }, { status: 404 });

    const share = bank.institutions.find((entry) => String(entry.institutionId) === String(user.institutionId));
    if (!share) return NextResponse.json({ error: 'Question bank not shared with this institution' }, { status: 404 });

    // Only accepted shares can publish results
    if (share.status !== 'accepted') {
      return NextResponse.json({ error: 'Institution must accept the share before publishing results' }, { status: 403 });
    }

    share.isResultsPublished = !!body.publish;
    await bank.save();

    // Mirror to PriTestBank if present
    try {
      const priBank = await PriTestBank.findById(id);
      if (priBank) {
        const priShare = priBank.institutions.find((entry: any) => String(entry.institutionId) === String(user.institutionId));
        if (priShare) {
          priShare.isResultsPublished = !!body.publish;
          await priBank.save();
        }
      }
    } catch (err) {
      console.warn('[institution publish] Failed to sync PriTestBank:', err);
    }

    return NextResponse.json({ success: true, isResultsPublished: !!body.publish }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/institution-admin/pri-tests/:id/publish]', error);
    return NextResponse.json({ error: 'Failed to update publication state' }, { status: 500 });
  }
}
