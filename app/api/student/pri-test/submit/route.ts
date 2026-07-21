import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse, { PriTestAnswerEvaluationStatus } from '@/models/PriTestResponse';
import UserAccount from '@/models/UserAccount';
import { getStudentFromAuthHeader } from '@/lib/auth';

function getUtcDayBounds(date: Date): { start: Date; end: Date } {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  return { start, end };
}

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
 * POST /api/student/pri-test/submit
 * Body: { answers: Array<{ questionIndex: number; selectedOption?: string; answerText?: string }> }
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

  const answers = Array.isArray(body.answers) ? body.answers : [];
  if (answers.length === 0) {
    return NextResponse.json({ error: 'answers must be a non-empty array' }, { status: 400 });
  }

  type NormalizedAnswer = {
    questionIndex: number;
    selectedOption: string | undefined;
    answerText: string | undefined;
    timeTakenSeconds?: number;
  };

  let hasAnswered = false;
  const normalizedAnswers: NormalizedAnswer[] = answers.flatMap((answer) => {
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
    if (selectedOption || answerText) {
      hasAnswered = true;
    }

    return [
      {
        questionIndex,
        selectedOption: selectedOption || undefined,
        answerText: answerText || undefined,
        timeTakenSeconds,
      },
    ];
  });

  if (normalizedAnswers.length === 0) {
    return NextResponse.json({ error: 'No valid answers provided' }, { status: 400 });
  }
  if (!hasAnswered) {
    return NextResponse.json({ error: 'Answer at least one question before submitting.' }, { status: 400 });
  }

  try {
    await connectDB();

    const enforceOneAttemptPerDay = (process.env.STUDENT_ONE_ATTEMPT_PER_DAY ?? 'true') === 'true';
    if (enforceOneAttemptPerDay) {
      const now = new Date();
      const { start, end } = getUtcDayBounds(now);

      const attemptsToday = await PriTestResponse.countDocuments({
        studentUserId: new mongoose.Types.ObjectId(student.id),
        institutionId: new mongoose.Types.ObjectId(student.institutionId),
        submittedAt: { $gte: start, $lte: end },
        status: 'submitted',
      });

      if (attemptsToday > 0) {
        return NextResponse.json(
          {
            error: 'You can only take the PRI test once per day. Please try again tomorrow.',
            code: 'ATTEMPT_LIMIT_REACHED',
          },
          { status: 403 }
        );
      }
    }

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

    const questions = bank.questions ?? [];
    const activeDomainIds = getActiveDomainIds(bank.domains ?? []);
    if (activeDomainIds.length === 0) {
      return NextResponse.json(
        { error: 'No active domain is available at this time', code: 'NO_ACTIVE_DOMAIN' },
        { status: 403 }
      );
    }
    const answersByIndex = new Map(normalizedAnswers.map((answer) => [answer.questionIndex, answer]));

    const submittedAnswers = questions.flatMap((question, index) => {
      const answer = answersByIndex.get(index);
      if (!answer) return [];
      if (!activeDomainIds.includes(question.domainId)) return [];

      const studentAnswer = question.questionType === 'written'
        ? (answer.answerText ?? '')
        : (answer.selectedOption ?? '');
      const correctAnswer = question.questionType === 'mcq' ? (question.correctAnswer ?? '') : undefined;
      const isCorrect = question.questionType === 'mcq'
        ? Boolean(correctAnswer && studentAnswer && studentAnswer === correctAnswer)
        : undefined;
      const needsAttention = question.questionType === 'written';

      if (question.questionType === 'written') {
        return [
          {
            questionIndex: index,
            questionId: `${bank._id}:${index}`,
            questionType: 'written' as const,
            domainId: question.domainId,
            subSkill: question.subSkill,
            answerText: answer.answerText ?? '',
            studentAnswer,
            correctAnswer,
            isCorrect,
            timeTakenSeconds: answer.timeTakenSeconds,
            evaluationStatus: 'pending' as PriTestAnswerEvaluationStatus,
            needsAttention,
            attentionReason: needsAttention ? 'Written response requires review' : undefined,
          },
        ];
      }

      return [
        {
          questionIndex: index,
          questionId: `${bank._id}:${index}`,
          questionType: 'mcq' as const,
          domainId: question.domainId,
          subSkill: question.subSkill,
          selectedOption: answer.selectedOption || undefined,
          studentAnswer,
          correctAnswer,
          isCorrect,
          timeTakenSeconds: answer.timeTakenSeconds,
          evaluationStatus: 'auto' as PriTestAnswerEvaluationStatus,
          needsAttention,
          attentionReason: needsAttention ? 'Written response requires review' : undefined,
        } as any,
      ];
    });

    if (submittedAnswers.length === 0) {
      return NextResponse.json({ error: 'Submitted answers are outside the active domain window' }, { status: 403 });
    }

    // Merge incoming answers with any already-saved answers so we never overwrite
    // answers that were persisted via the /save or main POST endpoint.
    const existing = await PriTestResponse.findOne({
      questionBankId: bank._id,
      studentUserId: new mongoose.Types.ObjectId(student.id),
      institutionId: new mongoose.Types.ObjectId(student.institutionId),
      status: 'in_progress',
    }).lean();

    const mergedAnswersMap = new Map(
      (existing?.answers ?? []).map((a: any) => [a.questionIndex, a])
    );
    submittedAnswers.forEach((a) => {
      mergedAnswersMap.set(a.questionIndex, { ...mergedAnswersMap.get(a.questionIndex), ...a });
    });
    const mergedAnswers = Array.from(mergedAnswersMap.values());

    const response = await PriTestResponse.findOneAndUpdate(
      {
        questionBankId: bank._id,
        studentUserId: new mongoose.Types.ObjectId(student.id),
        institutionId: new mongoose.Types.ObjectId(student.institutionId),
        status: 'in_progress',
      },
      {
        $set: {
          answers: mergedAnswers,
          status: 'submitted',
          evaluationStatus: 'pending',
          submittedAt: new Date(),
          lastActiveAt: new Date(),
          studentId,
          studentName,
          studentUsername: student.username,
          batch: studentBatch,
          programme: bank.program,
          examDate: new Date(),
        },
        $setOnInsert: {
          responseCode: `${bank._id}:${student.id}`,
          questionBankId: bank._id,
          studentUserId: new mongoose.Types.ObjectId(student.id),
          institutionId: new mongoose.Types.ObjectId(student.institutionId),
          startedAt: new Date(),
        },
      },
      { returnDocument: 'after', upsert: true }
    );

    return NextResponse.json(
      {
        responseId: response._id,
        status: response.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/student/pri-test/submit]', error);
    return NextResponse.json({ error: 'Failed to submit PRI test' }, { status: 500 });
  }
}
