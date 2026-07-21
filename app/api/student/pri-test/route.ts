import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse, { PriTestAnswerEvaluationStatus } from '@/models/PriTestResponse';
import UserAccount from '@/models/UserAccount';
import StudentResponse from '@/models/StudentResponse';
import { getStudentFromAuthHeader } from '@/lib/auth';
import { fetchQuestionBankQuestionsFromDB, generateQuestionBankQuestions } from '@/lib/question-bank-generator';

/**
 * GET /api/student/pri-test
 * Student: fetch active question bank (without correct answers).
 */
export async function GET(request: NextRequest) {
  const student = getStudentFromAuthHeader(request.headers.get('Authorization'));
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const now = new Date();
    const full = request.nextUrl.searchParams.get('full') === 'true';

    // Fetch the most recent active test for the institution
    const activeBanks = await PriTestBank.find({
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
      .select(full ? '+questions' : '-questions') // Optimization: don't even pull questions from DB if not full
      .lean();

    if (!activeBanks.length) {
      return NextResponse.json(
        { error: 'No active or upcoming PRI test available for your institution', code: 'NO_ACTIVE_TEST' },
        { status: 200 }
      );
    }

    // Fetch all student's submitted responses to filter out completed tests
    const submittedResponses = await PriTestResponse.find({
      studentUserId: student.id,
      questionBankId: { $in: activeBanks.map((b: any) => b._id) },
      status: { $in: ['submitted', 'closed'] },
    }).lean();

    const submittedBankIds = new Set(submittedResponses.map((r: any) => r.questionBankId.toString()));

    // Find the first test the student hasn't submitted yet
    const bank = activeBanks.find((b: any) => !submittedBankIds.has(b._id.toString()));

    if (!bank) {
      // If all active tests are already submitted, return the ALREADY_SUBMITTED flag
      // using the latest test's info
      const latestBank = activeBanks[0] as any;
      return NextResponse.json(
        { 
          error: 'You have already submitted all available PRI tests. Reattempts are not allowed.', 
          code: 'ALREADY_SUBMITTED',
          title: latestBank.title,
          program: latestBank.program
        },
        { status: 200 }
      );
    }

    const instEntry = bank.institutions?.find(
      (i: any) => i.institutionId.toString() === student.institutionId
    );

    // Helper to compute absolute timestamps from examStartDate + domain HH:mm time
    function combineDateAndTimeEarly(baseDate: Date | undefined, timeStr: string | undefined) {
      if (!baseDate || !timeStr) return null;
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeStr)) return null;
      // Treat baseDate as IST date: extract its UTC components and construct with IST offset
      const year = baseDate.getUTCFullYear();
      const month = (baseDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = baseDate.getUTCDate().toString().padStart(2, '0');
      return new Date(`${year}-${month}-${day}T${timeStr}:00+05:30`);
    }

    // Compute domain start times to find the earliest one
    const domainStartTimes = (bank.domains ?? [])
      .map(d => combineDateAndTimeEarly(instEntry?.examStartDate, d.domainStartTime))
      .filter((d): d is Date => d !== null);
    const earliestDomainStart = domainStartTimes.length > 0
      ? new Date(Math.min(...domainStartTimes.map(d => d.getTime())))
      : instEntry?.examStartDate ?? null;

    // Use the earliest domain start time for the "not started" check instead of raw examStartDate
    if (earliestDomainStart && earliestDomainStart > now) {
      // Also compute domain info for the countdown display
      const preStartDomains = (bank.domains ?? []).map(d => {
        const sAt = combineDateAndTimeEarly(instEntry?.examStartDate, d.domainStartTime);
        const eAt = combineDateAndTimeEarly(instEntry?.examStartDate, d.domainEndTime);
        return {
          domainId: d.domainId,
          domainName: d.domainName,
          domainStartTime: d.domainStartTime,
          domainEndTime: d.domainEndTime,
          startsAt: sAt ? sAt.toISOString() : null,
          endsAt: eAt ? eAt.toISOString() : null,
        };
      });

      return NextResponse.json(
        {
          error: 'PRI Test is scheduled but not yet active',
          code: 'TEST_NOT_STARTED',
          examStartDate: earliestDomainStart.toISOString(),
          title: bank.title,
          program: bank.program,
          domains: preStartDomains,
        },
        { status: 200 }
      );
    }

    // Response block correctly handles ALREADY_SUBMITTED above now.

    let bankQuestions = bank.questions ?? [];

    // ── Lazy Question Population (Only on full fetch to save bandwidth/IO) ──
    const domainsMissingQuestions = full ? (bank.domains ?? []).filter((domain) => {
      const count = bankQuestions.filter(
        (q) => q.domainId === domain.domainId
      ).length;
      return count === 0;
    }) : [];

    if (domainsMissingQuestions.length > 0) {
      let freshQuestions = await fetchQuestionBankQuestionsFromDB({
        program: bank.program,
        domains: domainsMissingQuestions,
      });

      // Last-resort fallback: use template questions so the domain always has
      // something to serve (avoids broken navigation / repeated ghost questions).
      if (freshQuestions.length === 0) {
        freshQuestions = generateQuestionBankQuestions({
          program: bank.program,
          domains: domainsMissingQuestions,
        });
      }

      if (freshQuestions.length > 0) {
        // Atomically add questions per domain — only insert if the domain is
        // still empty to prevent duplicate insertions from concurrent requests.
        for (const domain of domainsMissingQuestions) {
          const domainFreshQs = freshQuestions.filter(
            (q) => q.domainId === domain.domainId
          );
          if (domainFreshQs.length === 0) continue;

          await PriTestBank.findOneAndUpdate(
            {
              _id: bank._id,
              questions: { $not: { $elemMatch: { domainId: domain.domainId } } },
            },
            { $push: { questions: { $each: domainFreshQs } } }
          );

          // Extend the local snapshot so downstream logic sees the new questions
          // without needing to re-fetch the entire bank document.
          bankQuestions = [...bankQuestions, ...domainFreshQs];
        }
      }
    }

    // Fetch or create existing response to persist randomization
    let response = await PriTestResponse.findOne({
      studentUserId: student.id,
      questionBankId: bank._id,
    });

    if (!response) {
      const user = await UserAccount.findById(student.id).lean();
      response = new PriTestResponse({
        questionBankId: bank._id,
        studentUserId: student.id,
        institutionId: student.institutionId,
        studentId: user?.studentId || student.username,
        studentName: user?.fullName || student.username,
        studentUsername: student.username,
        batch: user?.batch,
        programme: bank.program,
        status: 'in_progress',
        evaluationStatus: 'pending',
        answers: [],
        startedAt: new Date(),
        lastActiveAt: new Date(),
      });
    }

    // Helper for shuffling
    const shuffle = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // 1. Question Randomization
    // Reset shuffle order if the bank was just extended (lazy population added
    // questions that the old shuffle order does not cover).
    const bankQuestionCount = bankQuestions.length;
    if (
      !response.questionShuffleOrder ||
      response.questionShuffleOrder.length === 0 ||
      response.questionShuffleOrder.length < bankQuestionCount
    ) {
      const indices = bankQuestions.map((_, i) => i);
      response.questionShuffleOrder = shuffle(indices);
      response.optionShuffleMaps = new Map(); // force option shuffle rebuild too
      await response.save();
    }

    // 2. Option Randomization
    if (!response.optionShuffleMaps || response.optionShuffleMaps.size === 0) {
      const maps = new Map<string, string[]>();
      bankQuestions.forEach((q, i) => {
        if (q.questionType === 'mcq' && q.options) {
          const labels = q.options.map(opt => opt.label);
          maps.set(i.toString(), shuffle(labels));
        }
      });
      response.optionShuffleMaps = maps;
      await response.save();
    }

    // Build per-domain question caps from the configured subskill questionCounts.
    // This prevents domains (e.g. Workspace Psychology) from serving more questions
    // than the admin configured when building the test.
    const domainQuestionCaps = new Map<string, number>();
    for (const domain of bank.domains ?? []) {
      const cap = domain.subskills?.reduce((sum, sub) => sum + (sub.questionCount || 0), 0) ?? 0;
      if (cap > 0) domainQuestionCaps.set(domain.domainId, cap);
    }
    const domainQuestionCounters = new Map<string, number>();

    // Serve questions — metadata only for dashboard, full for exam
    const shuffledQuestions = (response.questionShuffleOrder || [])
      .filter(bankIdx => {
        const q = bankQuestions[bankIdx];
        if (!q) return false;
        // Apply domain cap if configured
        const cap = domainQuestionCaps.get(q.domainId);
        if (cap !== undefined) {
          const count = domainQuestionCounters.get(q.domainId) ?? 0;
          if (count >= cap) return false;
          domainQuestionCounters.set(q.domainId, count + 1);
        }
        return true;
      })
      .map(bankIdx => {
        const q = bankQuestions[bankIdx];
        if (!q) return null;

        if (!full) {
          // Metadata only for initial dashboard load (SUPER FAST)
          return {
            index: bankIdx,
            domainId: q.domainId,
            subSkill: q.subSkill,
          };
        }

        // Handle option shuffling (Only on full fetch)
        let shuffledOptions = q.options || [];
        const shuffleMap = response?.optionShuffleMaps?.get(bankIdx.toString()) as string[] | undefined;
        if (shuffleMap && q.questionType === 'mcq') {
          shuffledOptions = shuffleMap.map((label: string) => q.options.find(opt => opt.label === label)!).filter(Boolean);
        }

        // Re-label options sequentially (A, B, C, D) after shuffle
        const sequentialLabels = ['A', 'B', 'C', 'D', 'E'];
        return {
          index: bankIdx,
          domainId: q.domainId,
          domainName: q.domainName,
          subSkill: q.subSkill,
          questionType: q.questionType,
          difficulty: q.difficulty ?? 'medium',
          questionText: q.questionText,
          questionImageUrl: q.questionImageUrl,
          caseContext: (q as any).caseContext,
          caseContextImageUrl: (q as any).caseContextImageUrl,
          options: q.questionType === 'mcq' ? shuffledOptions.map((opt, i) => ({
            label: sequentialLabels[i] ?? opt.label,
            originalLabel: opt.label,
            text: opt.text,
            imageUrl: opt.imageUrl,
          })) : [],
        };
      }).filter(Boolean);

    const examStartDate = bank.institutions?.find(i => i.institutionId.toString() === student.institutionId)?.examStartDate;

    // Compute per-domain absolute start/end timestamps and derive status using server time
    const serverNow = new Date();
    function combineDateAndTime(baseDate: Date | undefined, timeStr: string | undefined) {
      if (!baseDate || !timeStr) return null;
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeStr)) return null;
      const year = baseDate.getUTCFullYear();
      const month = (baseDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = baseDate.getUTCDate().toString().padStart(2, '0');
      // Construct ISO string with IST offset (+05:30)
      return new Date(`${year}-${month}-${day}T${timeStr}:00+05:30`);
    }

    const domains = (bank.domains ?? []).map((domain) => {
      const startsAt = combineDateAndTime(examStartDate, domain.domainStartTime);
      const endsAt = combineDateAndTime(examStartDate, domain.domainEndTime);

      // Responses for this domain (any answer with domainId)
      const hasAnyAnswer = (response.answers || []).some((a: any) => a.domainId === domain.domainId);

      // Determine per-domain response status
      const isDomainSubmitted = (response.submittedDomains || []).includes(domain.domainId);
      const isDomainTerminated = (response.terminatedDomains || []).includes(domain.domainId);
      
      let responseStatus: 'not_started' | 'in_progress' | 'completed' | 'closed' = 'not_started';
      
      if (isDomainTerminated) responseStatus = 'closed';
      else if (isDomainSubmitted) responseStatus = 'completed';
      else if (hasAnyAnswer) responseStatus = 'in_progress';

      // Locked/Unlocked and time deltas
      const isUnlocked = startsAt && endsAt ? serverNow >= startsAt && serverNow <= endsAt : false;
      const timeToUnlockMs = startsAt ? Math.max(0, startsAt.getTime() - serverNow.getTime()) : null;
      const timeToCloseMs = endsAt ? Math.max(0, endsAt.getTime() - serverNow.getTime()) : null;

      let lockedReason: string | null = null;
      if (responseStatus === 'closed') {
        if ((response.warningCount || 0) >= 5) lockedReason = 'terminated_by_proctoring';
        else if (endsAt && serverNow > endsAt) lockedReason = 'missed_window';
      }

      return {
        domainId: domain.domainId,
        domainName: domain.domainName,
        domainStartTime: domain.domainStartTime,
        domainEndTime: domain.domainEndTime,
        domainDate: examStartDate,
        startsAt: startsAt ? startsAt.toISOString() : null,
        endsAt: endsAt ? endsAt.toISOString() : null,
        isUnlocked,
        timeToUnlockMs,
        timeToCloseMs,
        responseStatus,
        lockedReason,
        warningCount: response.warningCount || 0,
      };
    });

    // Auto-submit or close expired domains (server-side enforcement)
    try {
      let studentResp = await StudentResponse.findOne({ studentUserId: student.id, testBankId: bank._id });
      let mutated = false;

      for (const dom of domains) {
        if (!dom.endsAt) continue;
        const endsAtDate = new Date(dom.endsAt);
        if (serverNow > endsAtDate) {
          // Skip if already finalized
          if (response.status === 'submitted' || response.status === 'closed') continue;

          const hasAnswersForDomain = (response.answers || []).some((a: any) => a.domainId === dom.domainId) ||
            (studentResp && (studentResp.responses || []).some((r: any) => r.domainId === dom.domainId));

          if (hasAnswersForDomain) {
            // Auto-submit this domain
            if (response.submittedDomains && !response.submittedDomains.includes(dom.domainId)) {
              response.submittedDomains.push(dom.domainId);
            }
            mutated = true;
          } else {
            // Auto-terminate this domain
            if (response.terminatedDomains && !response.terminatedDomains.includes(dom.domainId)) {
              response.terminatedDomains.push(dom.domainId);
            }
            mutated = true;
          }
        }
      }

      if (mutated) {
        await response.save();
        if (studentResp) await studentResp.save();
      }
    } catch (e) {
      console.error('Auto-submit/close check failed', e);
    }

    // Fetch student info for watermark — always available even before first POST
    const studentUser = await UserAccount.findById(student.id).lean();
    const studentId = response.studentId || studentUser?.studentId || student.username;
    const studentName = response.studentName || studentUser?.fullName || '';

    return NextResponse.json(
      {
        serverNow: serverNow.toISOString(),
        bank: {
          id: bank._id,
          title: bank.title,
          program: bank.program,
          examStartDate: bank.institutions?.find(i => i.institutionId.toString() === student.institutionId)?.examStartDate,
          examEndDate: bank.institutions?.find(i => i.institutionId.toString() === student.institutionId)?.examEndDate,
          isNoProctoringGraded: true, // Label per user request
        },
        studentInfo: { studentId, studentName },
        domains,
        questions: shuffledQuestions,
        existingResponse: {
          status: response.status,
          answers: response.answers,
          lastActiveAt: response.lastActiveAt,
          warningCount: response.warningCount || 0,
          submittedDomains: response.submittedDomains || [],
          terminatedDomains: response.terminatedDomains || [],
          studentId,
          studentName,
          startedAt: response.startedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/student/pri-test]', error);
    return NextResponse.json({ error: 'Failed to fetch PRI test' }, { status: 500 });
  }
}

/**
 * POST /api/student/pri-test
 * Save/Update an answer for a specific question.
 */
export async function POST(request: NextRequest) {
  const student = getStudentFromAuthHeader(request.headers.get('Authorization'));
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const {
      questionBankId, questionIndex, domainId, questionType,
      selectedOption, answerText, action, status, warningCount,
      timeTakenSeconds,
      // Domain timing fields (sent on submit_domain / terminate_domain)
      domainName: bodyDomainName,
      domainEnteredAt,
      scheduledStartTime,
      scheduledEndTime,
      // Warning reason (sent on proctoring violations)
      warningReason,
    } = body;

    if (!questionBankId) {
      return NextResponse.json({ error: 'Missing questionBankId' }, { status: 400 });
    }

    // Fetch bank early — needed for totalQuestions, subSkill, questionId, bankTitle, programme
    const bank = await PriTestBank.findById(questionBankId).lean() as any;
    const bankQuestion = bank?.questions && questionIndex !== undefined ? bank.questions[questionIndex] : null;

    // Find or create PriTestResponse (Active Session)
    let priResponse = await PriTestResponse.findOne({
      studentUserId: student.id,
      questionBankId: questionBankId,
    });

    if (!priResponse) {
      const user = await UserAccount.findById(student.id).lean();
      priResponse = new PriTestResponse({
        questionBankId,
        bankTitle: bank?.title,
        studentUserId: student.id,
        institutionId: student.institutionId,
        studentId: user?.studentId || student.username,
        studentName: user?.fullName || student.username,
        studentUsername: student.username,
        batch: user?.batch,
        programme: bank?.program,
        status: 'in_progress',
        evaluationStatus: 'pending',
        answers: [],
        startedAt: new Date(),
        lastActiveAt: new Date(),
      });
    }

    if (action === 'start_test') {
      priResponse.startedAt = new Date();
    }

    // ── Helper: upsert a domain timing entry ────────────────────────────────
    const upsertDomainTiming = (
      dId: string,
      timingStatus: 'submitted' | 'timeout' | 'terminated',
      answeredCount: number
    ) => {
      const now = new Date();
      const enteredMs = domainEnteredAt ? new Date(domainEnteredAt).getTime() : null;
      const timeSpentSeconds = enteredMs ? Math.max(0, Math.round((now.getTime() - enteredMs) / 1000)) : undefined;

      let scheduledDurationSeconds: number | undefined;
      if (scheduledStartTime && scheduledEndTime) {
        const [sh, sm] = scheduledStartTime.split(':').map(Number);
        const [eh, em] = scheduledEndTime.split(':').map(Number);
        scheduledDurationSeconds = Math.max(0, (eh * 60 + em - sh * 60 - sm) * 60);
      }

      if (!priResponse.domainTimings) priResponse.domainTimings = [];
      const existingIdx = priResponse.domainTimings.findIndex((d: any) => d.domainId === dId);
      const entry = {
        domainId: dId,
        domainName: bodyDomainName,
        scheduledStartTime,
        scheduledEndTime,
        scheduledDurationSeconds,
        enteredAt: enteredMs ? new Date(enteredMs) : undefined,
        submittedAt: now,
        timeSpentSeconds,
        status: timingStatus,
        answeredCount,
        totalQuestions: (bank?.questions as any[])?.filter((q: any) => q.domainId === dId).length || undefined,
      };
      if (existingIdx !== -1) {
        priResponse.domainTimings[existingIdx] = { ...priResponse.domainTimings[existingIdx], ...entry };
      } else {
        priResponse.domainTimings.push(entry as any);
      }
    };

    if (action === 'submit_domain' && body.domainId) {
      if (priResponse.submittedDomains && !priResponse.submittedDomains.includes(body.domainId)) {
        priResponse.submittedDomains.push(body.domainId);
      }
      const answeredCount = (priResponse.answers || []).filter((a: any) => a.domainId === body.domainId).length;
      upsertDomainTiming(body.domainId, 'submitted', answeredCount);
    }

    if (action === 'terminate_domain' && body.domainId) {
      if (priResponse.terminatedDomains && !priResponse.terminatedDomains.includes(body.domainId)) {
        priResponse.terminatedDomains.push(body.domainId);
      }
      const answeredCount = (priResponse.answers || []).filter((a: any) => a.domainId === body.domainId).length;
      upsertDomainTiming(body.domainId, 'terminated', answeredCount);
    }

    if (action === 'submit_final_test') {
      const now = new Date();
      priResponse.status = 'submitted';
      priResponse.submittedAt = now;
      if (priResponse.startedAt) {
        priResponse.testDurationSeconds = Math.max(
          0,
          Math.round((now.getTime() - priResponse.startedAt.getTime()) / 1000)
        );
      }
    }

    // Update PriTestResponse answers
    if (action === 'clear' && questionIndex !== undefined) {
      priResponse.answers = priResponse.answers.filter(a => a.questionIndex !== questionIndex);
    } else if (questionIndex !== undefined) {
      const existingAnswerIndex = priResponse.answers.findIndex(a => a.questionIndex === questionIndex);
      const resolvedQuestionType = questionType || bankQuestion?.questionType;
      const resolvedCorrectAnswer = resolvedQuestionType === 'mcq'
        ? (bankQuestion?.correctAnswer ?? undefined)
        : undefined;
      const resolvedIsCorrect = resolvedQuestionType === 'mcq' && resolvedCorrectAnswer
        ? Boolean(selectedOption && selectedOption === resolvedCorrectAnswer)
        : undefined;
      const newAnswer = {
        questionIndex,
        questionId: bankQuestion?._id?.toString() || bankQuestion?.id,
        questionType: resolvedQuestionType,
        domainId,
        subSkill: bankQuestion?.subSkill,
        selectedOption: selectedOption || undefined,
        answerText: answerText || undefined,
        studentAnswer: selectedOption || answerText || undefined,
        correctAnswer: resolvedCorrectAnswer,
        isCorrect: resolvedIsCorrect,
        timeTakenSeconds: timeTakenSeconds || undefined,
        evaluationStatus: (resolvedQuestionType === 'mcq' ? 'auto' : 'pending') as PriTestAnswerEvaluationStatus,
        needsAttention: resolvedQuestionType === 'written',
        attentionReason: resolvedQuestionType === 'written' ? 'Written response requires review' : undefined,
      };

      if (existingAnswerIndex !== -1) {
        priResponse.answers[existingAnswerIndex] = { ...priResponse.answers[existingAnswerIndex], ...newAnswer };
      } else {
        priResponse.answers.push(newAnswer as any);
      }
    } else if (action === 'batch_save' && body.batchAnswers) {
      for (const ans of body.batchAnswers) {
        const qIndex = ans.questionIndex;
        const qDomainId = ans.domainId;
        const qType = ans.questionType;
        const qAns = ans.selectedOption || ans.answerText;
        const qBankQuestion = bank.questions && qIndex !== undefined ? bank.questions[qIndex] : null;
        const resolvedQType = qType || qBankQuestion?.questionType;
        const resolvedCorrectAnswer = resolvedQType === 'mcq' ? (qBankQuestion?.correctAnswer ?? undefined) : undefined;
        const resolvedIsCorrect = resolvedQType === 'mcq' && resolvedCorrectAnswer ? Boolean(ans.selectedOption && ans.selectedOption === resolvedCorrectAnswer) : undefined;
        
        const existingAnsIdx = priResponse.answers.findIndex((a: any) => a.questionIndex === qIndex);
        const newAns = {
          questionIndex: qIndex,
          questionId: qBankQuestion?._id?.toString() || qBankQuestion?.id,
          questionType: resolvedQType,
          domainId: qDomainId,
          subSkill: qBankQuestion?.subSkill,
          selectedOption: ans.selectedOption || undefined,
          answerText: ans.answerText || undefined,
          studentAnswer: qAns || undefined,
          correctAnswer: resolvedCorrectAnswer,
          isCorrect: resolvedIsCorrect,
          evaluationStatus: (resolvedQType === 'mcq' ? 'auto' : 'pending') as PriTestAnswerEvaluationStatus,
          needsAttention: resolvedQType === 'written',
          attentionReason: resolvedQType === 'written' ? 'Written response requires review' : undefined,
        };
        
        if (existingAnsIdx !== -1) {
          priResponse.answers[existingAnsIdx] = { ...priResponse.answers[existingAnsIdx], ...newAns };
        } else {
          priResponse.answers.push(newAns as any);
        }
      }
    }

    if (status) {
      priResponse.status = status;
      if (status === 'submitted') priResponse.submittedAt = new Date();
    }

    if (warningCount !== undefined) {
      priResponse.warningCount = warningCount;
      // Append a timestamped warning event so violations are auditable
      if (!priResponse.warningEvents) priResponse.warningEvents = [];
      priResponse.warningEvents.push({ timestamp: new Date(), reason: warningReason });
    }
    priResponse.lastActiveAt = new Date();
    await priResponse.save();

    // POPULATE StudentResponse (For Detailed Insights)
    let studentResp = await StudentResponse.findOne({
      studentUserId: student.id,
      testBankId: questionBankId,
    });

    if (!studentResp) {
      const user = await UserAccount.findById(student.id).lean();
      studentResp = new StudentResponse({
        studentUserId: student.id,
        testBankId: questionBankId,
        institutionId: student.institutionId,
        studentId: user?.studentId || student.username,
        studentName: user?.fullName || student.username,
        studentUsername: student.username,
        responses: [],
        status: 'in_progress',
      });
    }

    if (questionIndex !== undefined && (selectedOption || answerText)) {
      const existingIdx = studentResp.responses.findIndex(r => r.questionIndex === questionIndex);
      const isCorrect = bankQuestion?.correctAnswer ? bankQuestion.correctAnswer === selectedOption : undefined;
      
      const newResp = {
        questionIndex,
        questionId: bankQuestion?._id?.toString() || bankQuestion?.id,
        domainId,
        subSkill: bankQuestion?.subSkill,
        difficulty: bankQuestion?.difficulty,
        selectedOption: (selectedOption || answerText) as string,
        timeTakenSeconds: timeTakenSeconds || 0,
        isCorrect,
        timestamp: new Date(),
      };

      if (existingIdx !== -1) {
        studentResp.responses[existingIdx] = newResp;
      } else {
        studentResp.responses.push(newResp);
      }
    } else if (action === 'batch_save' && body.batchAnswers) {
      for (const ans of body.batchAnswers) {
        const qIndex = ans.questionIndex;
        const qAns = ans.selectedOption || ans.answerText;
        if (qIndex !== undefined && qAns) {
          const qBankQuestion = bank.questions && qIndex !== undefined ? bank.questions[qIndex] : null;
          const existIdx = studentResp.responses.findIndex((r: any) => r.questionIndex === qIndex);
          const isCorrect = qBankQuestion?.correctAnswer ? qBankQuestion.correctAnswer === ans.selectedOption : undefined;
          
          const newRsp = {
            questionIndex: qIndex,
            questionId: qBankQuestion?._id?.toString() || qBankQuestion?.id,
            domainId: ans.domainId,
            subSkill: qBankQuestion?.subSkill,
            difficulty: qBankQuestion?.difficulty,
            selectedOption: qAns,
            timeTakenSeconds: ans.timeTakenSeconds || 0,
            isCorrect,
            timestamp: new Date(),
          };

          if (existIdx !== -1) {
            studentResp.responses[existIdx] = newRsp;
          } else {
            studentResp.responses.push(newRsp);
          }
        }
      }
    }

    studentResp.totalTimeTakenSeconds = studentResp.responses.reduce((acc, r) => acc + (r.timeTakenSeconds || 0), 0);

    // ── Sync domain summaries from priResponse.domainTimings ─────────────────
    if (priResponse.domainTimings && priResponse.domainTimings.length > 0) {
      if (!studentResp.domainSummaries) studentResp.domainSummaries = [];
      for (const dt of priResponse.domainTimings as any[]) {
        const existingIdx = studentResp.domainSummaries.findIndex((s: any) => s.domainId === dt.domainId);
        const summary = {
          domainId: dt.domainId,
          domainName: dt.domainName,
          timeSpentSeconds: dt.timeSpentSeconds ?? 0,
          answeredCount: dt.answeredCount ?? 0,
          totalQuestions: dt.totalQuestions,
          enteredAt: dt.enteredAt,
          submittedAt: dt.submittedAt,
          scheduledStartTime: dt.scheduledStartTime,
          scheduledEndTime: dt.scheduledEndTime,
          scheduledDurationSeconds: dt.scheduledDurationSeconds,
        };
        if (existingIdx !== -1) {
          studentResp.domainSummaries[existingIdx] = { ...studentResp.domainSummaries[existingIdx], ...summary };
        } else {
          studentResp.domainSummaries.push(summary as any);
        }
      }
    }

    // ── Sync test-level timing ────────────────────────────────────────────────
    if (!studentResp.testStartedAt && priResponse.startedAt) {
      studentResp.testStartedAt = priResponse.startedAt;
    }
    if (priResponse.submittedAt) {
      studentResp.testSubmittedAt = priResponse.submittedAt;
      studentResp.testDurationSeconds = priResponse.testDurationSeconds;
    }

    if (status === 'submitted' || action === 'submit_final_test') studentResp.status = 'completed';
    if (priResponse.status === 'closed') studentResp.status = 'closed';
    await studentResp.save();

    return NextResponse.json({ 
      success: true, 
      responseId: priResponse._id, 
      submittedDomains: priResponse.submittedDomains || [],
      terminatedDomains: priResponse.terminatedDomains || []
    });
  } catch (error) {
    console.error('[POST /api/student/pri-test]', error);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}
