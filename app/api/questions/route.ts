import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContributorQuestion, { IContributorQuestionOption } from '@/models/ContributorQuestion';
import { DOMAIN_MAP, CASE_BASED_TYPES } from '@/lib/domains';
import { getContributorFromAuthHeader } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/questions
 * Returns all questions submitted by the authenticated contributor.
 */
export async function GET(request: NextRequest) {
  const contributor = getContributorFromAuthHeader(request.headers.get('Authorization'));
  if (!contributor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    console.log(`[GET /api/questions] Fetching for contributorId: ${contributor.id} (username: ${contributor.username})`);
    
    const questions = await ContributorQuestion.find({
      contributorId: new mongoose.Types.ObjectId(contributor.id),
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[GET /api/questions] Found ${questions.length} questions.`);

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/questions]', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

/**
 * POST /api/questions
 * Contributor submits a new question for admin approval.
 * Body: {
 *  domain,
 *  subSkill,
 *  questionType,
 *  questionText,
 *  questionImageUrl?,
 *  caseContext?,
 *  caseContextImageUrl?,
 *  bloomLevel,
 *  options?,
 *  correctAnswer?,
 *  explanation?,
 *  explanationImageUrl?,
 *  difficulty
 *  estimatedTimeMinutes
 * }
 */
export async function POST(request: NextRequest) {
  const contributor = getContributorFromAuthHeader(request.headers.get('Authorization'));
  if (!contributor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    domain,
    subSkill,
    questionType,
    questionText,
    questionImageUrl,
    sourceDetails,
    caseContext,
    caseContextImageUrl,
    bloomLevel,
    options,
    correctAnswer,
    explanation,
    explanationImageUrl,
    difficulty,
    estimatedTimeMinutes,
  } = body;

  // --- Validate domain ---
  if (typeof domain !== 'string' || !DOMAIN_MAP[domain as keyof typeof DOMAIN_MAP]) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }

  const domainMeta = DOMAIN_MAP[domain as keyof typeof DOMAIN_MAP];
  const isWorkspacePsychology = domainMeta.id === 'workspace-psychology';

  if (typeof subSkill !== 'string' || !domainMeta.skills.includes(subSkill)) {
    return NextResponse.json({ error: 'Invalid subskill for this domain' }, { status: 400 });
  }

  if (questionType !== 'mcq' && questionType !== 'written') {
    return NextResponse.json({ error: 'questionType must be "mcq" or "written"' }, { status: 400 });
  }

  const validBloomLevels = ['Remember', 'Understand', 'Apply', 'Analyse', 'Create', 'Evaluate'];
  if (!isWorkspacePsychology) {
    if (typeof bloomLevel !== 'string' || !validBloomLevels.includes(bloomLevel)) {
      return NextResponse.json(
        { error: 'bloomLevel must be one of Remember, Understand, Apply, Analyse, Create, Evaluate' },
        { status: 400 }
      );
    }
  }

  // --- Validate questionText ---
  if (typeof questionText !== 'string' || questionText.trim().length < 10) {
    return NextResponse.json(
      { error: 'Question text must be at least 10 characters' },
      { status: 400 }
    );
  }

  // --- Validate options + correctAnswer ---
  if (questionType === 'mcq') {
    if (
      !Array.isArray(options) ||
      options.length < 2 ||
      options.length > 5 ||
      !options.every(
        (o) =>
          typeof o === 'object' &&
          o !== null &&
          typeof (o as Record<string, unknown>).label === 'string' &&
          typeof (o as Record<string, unknown>).text === 'string' &&
          ((o as Record<string, unknown>).text as string).trim().length > 0
      )
    ) {
      return NextResponse.json(
        { error: 'Options must be an array of 2–5 items each with label and text' },
        { status: 400 }
      );
    }

    if (isWorkspacePsychology) {
      const allowedScores = new Set([-1, 0, 0.5, 1]);
      if (
        !options.every(
          (o) =>
            typeof (o as Record<string, unknown>).score === 'number' &&
            allowedScores.has((o as Record<string, unknown>).score as number)
        )
      ) {
        return NextResponse.json(
          { error: 'Each option must have a score of -1, 0, 0.5, or 1' },
          { status: 400 }
        );
      }
    } else {
      if (typeof correctAnswer !== 'string' || !correctAnswer.trim()) {
        return NextResponse.json(
          { error: 'correctAnswer is required for MCQ questions' },
          { status: 400 }
        );
      }
      const optionLabels = (options as Array<{ label: string }>).map((o) => o.label);
      if (!optionLabels.includes(correctAnswer)) {
        return NextResponse.json(
          { error: 'correctAnswer must match one of the option labels' },
          { status: 400 }
        );
      }
    }
  }


  const validDifficulties = ['easy', 'medium', 'hard'];
  const resolvedDifficulty =
    typeof difficulty === 'string' && validDifficulties.includes(difficulty)
      ? difficulty
      : 'medium';

  if (
    typeof estimatedTimeMinutes !== 'number' ||
    !Number.isFinite(estimatedTimeMinutes) ||
    estimatedTimeMinutes <= 0 ||
    estimatedTimeMinutes > 240
  ) {
    return NextResponse.json(
      { error: 'estimatedTimeMinutes must be a number between 0.1 and 240' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const question = await ContributorQuestion.create({
      domain: domain as string,
      subSkill: subSkill as string,
      assessmentType: domainMeta.assessmentType,
      questionType: questionType as 'mcq' | 'written',
      questionText: (questionText as string).trim(),
      ...(typeof questionImageUrl === 'string' && questionImageUrl.trim()
        ? { questionImageUrl: questionImageUrl.trim() }
        : {}),
      ...(typeof sourceDetails === 'string' && sourceDetails.trim()
        ? { sourceDetails: sourceDetails.trim() }
        : {}),
      ...(typeof caseContext === 'string' && caseContext.trim()
        ? { caseContext: caseContext.trim() }
        : {}),
      ...(typeof caseContextImageUrl === 'string' && caseContextImageUrl.trim()
        ? { caseContextImageUrl: caseContextImageUrl.trim() }
        : {}),
      ...(questionType === 'mcq' ? { options: options as IContributorQuestionOption[] } : { options: [] }),
      ...(questionType === 'mcq' && typeof correctAnswer === 'string' && !isWorkspacePsychology
        ? { correctAnswer }
        : {}),
      ...(questionType === 'mcq' && typeof explanation === 'string' && explanation.trim()
        ? { explanation: explanation.trim() }
        : {}),
      ...(questionType === 'mcq' && typeof explanationImageUrl === 'string' && explanationImageUrl.trim()
        ? { explanationImageUrl: explanationImageUrl.trim() }
        : {}),
      ...(!isWorkspacePsychology && typeof bloomLevel === 'string' ? { bloomLevel } : {}),
      difficulty: resolvedDifficulty,
      estimatedTimeMinutes,
      contributorId: new mongoose.Types.ObjectId(contributor.id),
      contributorUsername: contributor.username,
      status: 'pending',
    });

    console.log(
      `[Questions] ✅ New question submitted by "${contributor.username}" for domain "${domain}" — ID: ${question._id}`
    );

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/questions]', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const firstError = Object.values(error.errors)[0];
      return NextResponse.json(
        { error: firstError?.message ?? 'Validation failed while submitting question' },
        { status: 400 }
      );
    }
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Duplicate question detected' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to submit question' }, { status: 500 });
  }
}
