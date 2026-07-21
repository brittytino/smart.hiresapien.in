import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import ContributorQuestion from '@/models/ContributorQuestion';
import Question from '@/models/Question';
import { getAdminFromAuthHeader } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/questions/[id]/review
 * Admin approves or rejects a contributor's question.
 * Body: { action: 'approve' | 'reject'; reviewNote?: string }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
  }

  let body: { action?: unknown; reviewNote?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action, reviewNote } = body;
  const resolvedReviewNote = typeof reviewNote === 'string' ? reviewNote.trim() : '';

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json(
      { error: 'action must be "approve" or "reject"' },
      { status: 400 }
    );
  }

  if (action === 'reject' && !resolvedReviewNote) {
    return NextResponse.json(
      { error: 'A review note is required when rejecting a question' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const contributorQuestion = await ContributorQuestion.findById(id);
    if (!contributorQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    if (action === 'approve') {
      if (contributorQuestion.status === 'approved') {
        return NextResponse.json(
          { error: 'Question is already approved' },
          { status: 409 }
        );
      }

      const existingApproved = await Question.findOne({ uniqueId: contributorQuestion.uniqueId })
        .select('_id')
        .lean();
      if (existingApproved) {
        return NextResponse.json(
          { error: 'Approved question already exists for this submission' },
          { status: 409 }
        );
      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const approvedQuestion = await Question.create(
          [
            {
              uniqueId: contributorQuestion.uniqueId,
              domain: contributorQuestion.domain,
              subSkill: contributorQuestion.subSkill,
              assessmentType: contributorQuestion.assessmentType,
              bloomLevel: contributorQuestion.bloomLevel,
              questionType: contributorQuestion.questionType,
              questionText: contributorQuestion.questionText,
              ...(contributorQuestion.questionImageUrl
                ? { questionImageUrl: contributorQuestion.questionImageUrl }
                : {}),
              ...(contributorQuestion.caseContext
                ? { caseContext: contributorQuestion.caseContext }
                : {}),
              ...(contributorQuestion.caseContextImageUrl
                ? { caseContextImageUrl: contributorQuestion.caseContextImageUrl }
                : {}),
              options: contributorQuestion.options,
              ...(contributorQuestion.correctAnswer
                ? { correctAnswer: contributorQuestion.correctAnswer }
                : {}),
              ...(contributorQuestion.explanation
                ? { explanation: contributorQuestion.explanation }
                : {}),
              ...(contributorQuestion.explanationImageUrl
                ? { explanationImageUrl: contributorQuestion.explanationImageUrl }
                : {}),
              difficulty: contributorQuestion.difficulty,
              estimatedTimeMinutes: contributorQuestion.estimatedTimeMinutes,
              contributorId: contributorQuestion.contributorId,
              contributorUsername: contributorQuestion.contributorUsername,
              status: 'approved',
              reviewNote: resolvedReviewNote || undefined,
              reviewedAt: new Date(),
              reviewedBy: admin.username,
            },
          ],
          { session }
        );

        contributorQuestion.status = 'approved';
        contributorQuestion.reviewNote = resolvedReviewNote || undefined;
        contributorQuestion.reviewedAt = new Date();
        contributorQuestion.reviewedBy = admin.username;
        await contributorQuestion.save({ session });

        await session.commitTransaction();
        session.endSession();

        console.log(
          `[Admin Review] ✅ Approved question ${id} by admin "${admin.username}"`
        );

        return NextResponse.json({ question: approvedQuestion[0] }, { status: 200 });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    contributorQuestion.status = 'rejected';
    contributorQuestion.reviewNote = resolvedReviewNote;
    contributorQuestion.reviewedAt = new Date();
    contributorQuestion.reviewedBy = admin.username;
    const question = await contributorQuestion.save();

    console.log(
      `[Admin Review] ❌ Rejected question ${id} by admin "${admin.username}"`
    );

    return NextResponse.json({ question }, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/admin/questions/[id]/review]', error);
    return NextResponse.json({ error: 'Failed to review question' }, { status: 500 });
  }
}
