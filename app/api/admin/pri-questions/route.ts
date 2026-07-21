import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PriQuestion } from '@/models/PriTest';
import { getAdminFromAuthHeader } from '@/lib/auth';

/**
 * GET /api/admin/pri-questions
 * Admin: list all PRI MCQs.
 */
export async function GET(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const questions = await PriQuestion.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/pri-questions]', error);
    return NextResponse.json({ error: 'Failed to fetch PRI questions' }, { status: 500 });
  }
}

/**
 * POST /api/admin/pri-questions
 * Admin: create PRI test MCQ.
 * Body: { questionText: string, options: Array<{label,text}>, correctAnswer: string }
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

  const questionText = typeof body.questionText === 'string' ? body.questionText.trim() : '';
  const options = Array.isArray(body.options) ? body.options : [];
  const correctAnswer = typeof body.correctAnswer === 'string' ? body.correctAnswer.trim() : '';

  if (questionText.length < 10) {
    return NextResponse.json({ error: 'Question text must be at least 10 characters' }, { status: 400 });
  }

  const normalizedOptions = options
    .map((opt) => {
      if (
        typeof opt === 'object' &&
        opt !== null &&
        typeof (opt as Record<string, unknown>).label === 'string' &&
        typeof (opt as Record<string, unknown>).text === 'string'
      ) {
        return {
          label: ((opt as Record<string, string>).label || '').trim(),
          text: ((opt as Record<string, string>).text || '').trim(),
        };
      }
      return null;
    })
    .filter((v): v is { label: string; text: string } => Boolean(v?.label && v.text));

  if (normalizedOptions.length < 2 || normalizedOptions.length > 5) {
    return NextResponse.json({ error: 'Options must contain between 2 and 5 valid options' }, { status: 400 });
  }

  const labels = normalizedOptions.map((o) => o.label);
  if (!labels.includes(correctAnswer)) {
    return NextResponse.json({ error: 'correctAnswer must match one of option labels' }, { status: 400 });
  }

  try {
    await connectDB();

    const question = await PriQuestion.create({
      questionText,
      options: normalizedOptions,
      correctAnswer,
      createdBy: admin.username,
      isActive: true,
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/pri-questions]', error);
    return NextResponse.json({ error: 'Failed to create PRI question' }, { status: 500 });
  }
}
