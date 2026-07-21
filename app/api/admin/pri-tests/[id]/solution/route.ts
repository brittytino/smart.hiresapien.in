import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import { getAdminFromAuthHeader } from '@/lib/auth';

/**
 * GET /api/admin/pri-tests/:id/solution
 * Admin-only: return full solution key (excludes workspace-psychology content)
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await connectDB();

    // Prefer QuestionBank (canonical), fallback to PriTestBank
    let bank = await QuestionBank.findById(id).lean() as any;
    if (!bank) {
      bank = await PriTestBank.findById(id).lean() as any;
    }
    if (!bank) return NextResponse.json({ error: 'Bank not found' }, { status: 404 });

    const questions = (bank.questions || []).map((q: any, idx: number) => ({ q, idx }));

    const solutionKey = questions
      .filter(({ q }: { q: any; idx: number }) => q.questionType === 'mcq' && q.domainId !== 'workspace-psychology')
      .map(({ q, idx }: { q: any; idx: number }) => ({
        questionId: String(idx),
        questionText: q.questionText ?? '',
        questionImageUrl: q.questionImageUrl ?? null,
        caseContext: q.caseContext ?? null,
        caseContextImageUrl: q.caseContextImageUrl ?? null,
        options: q.options ?? [],
        correctAnswer: q.correctAnswer ?? '',
        domain: q.domainId ?? '',
        subSkill: q.subSkill ?? '',
      }));

    return NextResponse.json({ bank: { title: bank.title, program: bank.program }, solutionKey }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/pri-tests/:id/solution]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
