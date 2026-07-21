import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContributorQuestion from '@/models/ContributorQuestion';
import Question from '@/models/Question';
import { getAdminFromAuthHeader } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/admin/questions
 * Admin: list all questions — optionally filter by status, domain, or contributor.
 * Query params: ?status=pending|approved|rejected  &domain=<domainId>  &contributorId=<id>  &contributorSearch=<username>
 *               &page=1  &pageSize=20  &sortBy=createdAt|contributorUsername|domain  &sortDir=asc|desc
 */
export async function GET(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const domain = searchParams.get('domain');
  const subSkill = searchParams.get('subSkill');
  const contributorId = searchParams.get('contributorId');
  const contributorSearch = searchParams.get('contributorSearch');
  const search = searchParams.get('search');
  const pageParam = searchParams.get('page');
  const pageSizeParam = searchParams.get('pageSize');
  const sortByParam = searchParams.get('sortBy');
  const sortDirParam = searchParams.get('sortDir');

  const filter: Record<string, unknown> = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    filter.status = status;
  }
  if (domain) {
    filter.domain = domain;
  }
  if (subSkill) {
    filter.subSkill = subSkill;
  }
  if (contributorId) {
    if (!mongoose.Types.ObjectId.isValid(contributorId)) {
      return NextResponse.json({ error: 'Invalid contributorId' }, { status: 400 });
    }
    filter.contributorId = new mongoose.Types.ObjectId(contributorId);
  }
  if (contributorSearch) {
    filter.contributorUsername = { $regex: contributorSearch, $options: 'i' };
  }
  if (search) {
    filter.questionText = { $regex: search, $options: 'i' };
  }

  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(pageSizeParam) || 20));
  const sortBy = ['createdAt', 'contributorUsername', 'domain'].includes(String(sortByParam))
    ? (sortByParam as 'createdAt' | 'contributorUsername' | 'domain')
    : 'createdAt';
  const sortDir = sortDirParam === 'asc' ? 1 : -1;

  try {
    await connectDB();
    let total: number;
    let questions: any[];

    if (status === 'approved') {
      total = await Question.countDocuments(filter as any);
      questions = await Question.find(filter as any)
        .populate('contributorId', 'displayName')
        .sort({ [sortBy]: sortDir, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();
    } else {
      total = await ContributorQuestion.countDocuments(filter as any);
      questions = await ContributorQuestion.find(filter as any)
        .populate('contributorId', 'displayName')
        .sort({ [sortBy]: sortDir, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();
    }
    const normalizedQuestions = questions.map((question: any) => ({
      ...question,
      _id: question._id?.toString?.() ?? question._id,
      contributorId: typeof question.contributorId === 'object' 
        ? question.contributorId 
        : (question.contributorId?.toString?.() ?? question.contributorId),
    }));

    const contributors = await ContributorQuestion.aggregate([
      {
        $group: {
          _id: {
            contributorId: '$contributorId',
            contributorUsername: '$contributorUsername',
          },
          totalQuestions: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          contributorId: { $toString: '$_id.contributorId' },
          contributorUsername: '$_id.contributorUsername',
          totalQuestions: 1,
        },
      },
      { $sort: { totalQuestions: -1, contributorUsername: 1 } },
    ]);

    const domainStats = await Question.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          domainId: '$_id',
          count: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        questions: normalizedQuestions,
        contributors,
        domainStats,
        pagination: {
          total,
          page,
          pageSize,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/admin/questions]', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
