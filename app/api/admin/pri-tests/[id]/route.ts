import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionBank, { type IQuestionBankQuestion, type QuestionDifficulty, type QuestionType } from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse from '@/models/PriTestResponse';
import StudentResponse from '@/models/StudentResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import { getAdminFromAuthHeader } from '@/lib/auth';

function normalizeQuestion(question: Record<string, unknown>): IQuestionBankQuestion | null {
  const questionText = typeof question.questionText === 'string' ? question.questionText.trim() : '';
  const questionType: QuestionType = question.questionType === 'written' ? 'written' : ('mcq' as const);
  const difficultyInput = typeof question.difficulty === 'string' ? question.difficulty : 'medium';
  const difficulty: QuestionDifficulty = ['easy', 'medium', 'hard'].includes(difficultyInput)
    ? (difficultyInput as QuestionDifficulty)
    : 'medium';
  const domainId = typeof question.domainId === 'string' ? question.domainId : '';
  const domainName = typeof question.domainName === 'string' ? question.domainName : '';
  const subSkill = typeof question.subSkill === 'string' ? question.subSkill : '';
  const optionsInput = Array.isArray(question.options) ? question.options : [];
  const correctAnswer = typeof question.correctAnswer === 'string' ? question.correctAnswer.trim() : undefined;

  const isPsychology = domainId === 'workspace-psychology';
  const options = optionsInput
    .map((opt) => {
      if (typeof opt !== 'object' || opt === null) return null;
      const record = opt as Record<string, unknown>;
      const label = typeof record.label === 'string' ? record.label.trim() : '';
      const text = typeof record.text === 'string' ? record.text.trim() : '';
      const score = typeof record.score === 'number' ? record.score : undefined;
      if (!label || !text) return null;
      return { label, text, ...(score !== undefined ? { score } : {}) };
    })
    .filter((opt): opt is { label: string; text: string; score?: number } => opt !== null);

  if (!questionText || !domainId || !domainName || !subSkill) return null;

  if (questionType === 'mcq') {
    if (options.length < 2) return null;
    const labels = options.map((o) => o.label);
    if (!isPsychology) {
      if (!correctAnswer || !labels.includes(correctAnswer)) return null;
    }
  }

  return {
    domainId,
    domainName,
    subSkill,
    questionType,
    difficulty,
    questionText,
    options,
    correctAnswer: questionType === 'mcq' ? correctAnswer : undefined,
  };
}

/**
 * GET /api/admin/pri-tests/:id
 * Admin: fetch question bank detail.
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
    const [bank, priTestBank] = await Promise.all([
      QuestionBank.findById(id).lean(),
      PriTestBank.findById(id).lean(),
    ]);

    if (!bank && !priTestBank) {
      return NextResponse.json({ error: 'Question bank not found' }, { status: 404 });
    }

    return NextResponse.json({ bank, priTestBank }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/pri-tests/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch PRI test' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/pri-tests/:id
 * Admin: update draft question bank questions.
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  const title = typeof body.title === 'string' ? body.title.trim() : undefined;
  const program = typeof body.program === 'string' ? body.program.trim() : undefined;
  const statusUpdate =
    typeof body.status === 'string' && ['draft', 'published', 'completed'].includes(body.status)
      ? (body.status as 'draft' | 'published' | 'completed')
      : undefined;
  const questionsInput = Array.isArray(body.questions) ? body.questions : null;

  let questions: IQuestionBankQuestion[] | undefined;
  if (questionsInput) {
    questions = questionsInput
      .map((q) => (typeof q === 'object' && q !== null ? normalizeQuestion(q as Record<string, unknown>) : null))
      .filter((q): q is IQuestionBankQuestion => q !== null);

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'questions must be a non-empty array' }, { status: 400 });
    }
  }

  try {
    await connectDB();

    const bank = await QuestionBank.findById(id);
    if (!bank) return NextResponse.json({ error: 'Question bank not found' }, { status: 404 });

    if (title) bank.title = title;
    if (program) bank.program = program;
    if (questions) bank.questions = questions;
    if (statusUpdate) bank.status = statusUpdate;

    await bank.save();

    await PriTestBank.findOneAndUpdate(
      { _id: bank._id },
      {
        ...(title ? { title } : {}),
        ...(program ? { program } : {}),
        ...(questions ? { questions } : {}),
        ...(statusUpdate ? { status: statusUpdate } : {}),
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return NextResponse.json({ bank }, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/admin/pri-tests/:id]', error);
    return NextResponse.json({ error: 'Failed to update PRI test' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/pri-tests/:id
 * Admin: delete question bank.
 */
export async function DELETE(
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
    const bankId = new mongoose.Types.ObjectId(id);

    const [bankResult, priResult] = await Promise.all([
      QuestionBank.findByIdAndDelete(id),
      PriTestBank.findByIdAndDelete(id),
    ]);

    if (!bankResult && !priResult) {
      return NextResponse.json({ error: 'Question bank not found' }, { status: 404 });
    }

    // Cascade delete: remove all student responses, evaluations, and student response records.
    // Match both ObjectId and string variants to handle any type inconsistencies.
    await Promise.all([
      PriTestResponse.deleteMany({ $or: [{ questionBankId: bankId }, { questionBankId: id }] }),
      StudentResponse.deleteMany({ $or: [{ testBankId: bankId }, { testBankId: id }] }),
      PriTestEvaluation.deleteMany({ $or: [{ questionBankId: bankId }, { questionBankId: id }] }),
    ]);

    return NextResponse.json({ ok: true, cascadeDeleted: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/admin/pri-tests/:id]', error);
    return NextResponse.json({ error: 'Failed to delete PRI test' }, { status: 500 });
  }
}
