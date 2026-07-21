import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse, { PriTestAnswerEvaluationStatus } from '@/models/PriTestResponse';
import UserAccount from '@/models/UserAccount';
import { getStudentFromAuthHeader } from '@/lib/auth';

type AnswerPayload = {
  questionIndex: number;
  selectedOption?: string;
  answerText?: string;
  timeTakenSeconds?: number;
};

function parseTimeToToday(value: string): Date | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  // Get current date components in IST (UTC+5:30)
  const now = new Date();
  const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const year = istNow.getUTCFullYear();
  const month = (istNow.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = istNow.getUTCDate().toString().padStart(2, '0');
  return new Date(`${year}-${month}-${day}T${value}:00+05:30`);
}

function getActiveDomainIds(domains: Array<{ domainId: string; domainStartTime: string; domainEndTime: string }>) {
  const now = new Date();
  return domains.flatMap((domain) => {
    const start = parseTimeToToday(domain.domainStartTime);
    const end = parseTimeToToday(domain.domainEndTime);
    if (!start || !end) return [];
    if (now >= start && now <= end) return [domain.domainId];
    return [];
  });
}

/**
 * POST /api/student/pri-test/save
 * Body: { answers: Array<{ questionIndex: number; selectedOption?: string; answerText?: string }>, currentDomainId?: string, currentQuestionIndex?: number }
 */
export async function POST(request: NextRequest) {
  const student = getStudentFromAuthHeader(request.headers.get('Authorization'));
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const answersInput = Array.isArray(body.answers) ? body.answers : [];
  const currentDomainId = typeof body.currentDomainId === 'string' ? body.currentDomainId : undefined;
  const currentQuestionIndex = typeof body.currentQuestionIndex === 'number' ? body.currentQuestionIndex : undefined;

  const answers: AnswerPayload[] = answersInput.flatMap((answer) => {
    if (typeof answer !== 'object' || answer === null) return [];
    const record = answer as Record<string, unknown>;
    const questionIndex = typeof record.questionIndex === 'number' ? record.questionIndex : NaN;
    const selectedOption = typeof record.selectedOption === 'string' ? record.selectedOption.trim() : '';
    const answerText = typeof record.answerText === 'string' ? record.answerText.trim() : '';
    const timeTakenSeconds =
      typeof record.timeTakenSeconds === 'number' && Number.isFinite(record.timeTakenSeconds)
        ? Math.max(0, Math.round(record.timeTakenSeconds))
        : undefined;

    if (!Number.isFinite(questionIndex) || questionIndex < 0) return [];
    if (!selectedOption && !answerText && !timeTakenSeconds) return [];

    return [{
      questionIndex,
      selectedOption: selectedOption || undefined,
      answerText: answerText || undefined,
      timeTakenSeconds,
    }];
  });

  if (answers.length === 0) {
    return NextResponse.json({ error: 'No valid answers provided' }, { status: 400 });
  }

  try {
    await connectDB();

    const now = new Date();
    const bank = await PriTestBank.findOne({
      status: 'published',
      institutions: {
        $elemMatch: {
          institutionId: student.institutionId,
          status: 'accepted',
          examEndDate: { $gte: now },
        },
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!bank) {
      return NextResponse.json(
        { error: 'No active PRI test available for your institution', code: 'NO_ACTIVE_TEST' },
        { status: 404 }
      );
    }

    const studentAccount = await UserAccount.findById(student.id).lean();
    const studentName = studentAccount?.fullName ?? student.username;
    const studentId = studentAccount?.studentId;
    const studentBatch = (studentAccount as unknown as { batch?: string })?.batch;

    const activeDomainIds = getActiveDomainIds(bank.domains ?? []);
    if (activeDomainIds.length === 0) {
      return NextResponse.json(
        { error: 'No active domain is available at this time', code: 'NO_ACTIVE_DOMAIN' },
        { status: 403 }
      );
    }

    const questions = bank.questions ?? [];
    const answerMap = new Map(answers.map((answer) => [answer.questionIndex, answer]));

    const normalizedAnswers = Array.from(answerMap.entries()).flatMap(([index, answer]) => {
      const question = questions[index];
      if (!question) return [];
      if (!activeDomainIds.includes(question.domainId)) return [];

      const studentAnswer = question.questionType === 'written'
        ? (answer.answerText ?? '')
        : (answer.selectedOption ?? '');
      const correctAnswer = question.questionType === 'mcq' ? (question.correctAnswer ?? '') : undefined;
      const isCorrect = question.questionType === 'mcq'
        ? Boolean(correctAnswer && studentAnswer && studentAnswer === correctAnswer)
        : undefined;
      const needsAttention = question.questionType === 'written';

      return [{
        questionIndex: index,
        questionId: `${bank._id}:${index}`,
        questionType: question.questionType,
        domainId: question.domainId,
        subSkill: question.subSkill,
        selectedOption: answer.selectedOption,
        answerText: answer.answerText,
        studentAnswer,
        correctAnswer,
        isCorrect,
        timeTakenSeconds: answer.timeTakenSeconds,
        evaluationStatus: (question.questionType === 'mcq' ? 'auto' : 'pending') as PriTestAnswerEvaluationStatus,
        needsAttention,
        attentionReason: needsAttention ? 'Written response requires review' : undefined,
      }];
    });

    if (normalizedAnswers.length === 0) {
      return NextResponse.json({ error: 'Answers are outside the active domain window' }, { status: 403 });
    }

    const response = await PriTestResponse.findOneAndUpdate(
      {
        questionBankId: bank._id,
        studentUserId: new mongoose.Types.ObjectId(student.id),
        institutionId: new mongoose.Types.ObjectId(student.institutionId),
        status: 'in_progress',
      },
      {
        $set: {
          lastActiveAt: new Date(),
          currentDomainId,
          currentQuestionIndex,
          studentId,
          studentName,
          studentUsername: student.username,
          batch: studentBatch,
          programme: bank.program,
        },
        $setOnInsert: {
          responseCode: `${bank._id}:${student.id}`,
          questionBankId: bank._id,
          studentUserId: new mongoose.Types.ObjectId(student.id),
          institutionId: new mongoose.Types.ObjectId(student.institutionId),
          status: 'in_progress',
          evaluationStatus: 'pending',
          startedAt: new Date(),
          examDate: new Date(),
        },
      },
      { returnDocument: 'after', upsert: true }
    );

    const existingAnswers = response.answers ?? [];
    const merged = new Map(existingAnswers.map((ans) => [ans.questionIndex, ans]));
    normalizedAnswers.forEach((ans) => {
      const prev = merged.get(ans.questionIndex);
      const timeTakenSeconds = Math.max(prev?.timeTakenSeconds ?? 0, ans.timeTakenSeconds ?? 0);
      merged.set(ans.questionIndex, {
        ...prev,
        ...ans,
        timeTakenSeconds: timeTakenSeconds || undefined,
      });
    });

    response.answers = Array.from(merged.values());
    await response.save();

    return NextResponse.json({ responseId: response._id }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/student/pri-test/save]', error);
    return NextResponse.json({ error: 'Failed to save PRI test progress' }, { status: 500 });
  }
}
