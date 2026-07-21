import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Institution from '@/models/Institution';
import Contributor from '@/models/Contributor';
import ContributorQuestion from '@/models/ContributorQuestion';
import Question from '@/models/Question';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Aggregate Institution Stats
    const institutions = await Institution.find({});
    const totalInstitutions = institutions.length;
    const totalFacultySlots = institutions.reduce((acc, inst) => acc + inst.facultySlotLimit, 0);
    const totalStudentSlots = institutions.reduce((acc, inst) => acc + inst.studentSlotLimit, 0);

    // Aggregate Contributor Stats
    const contributors = await Contributor.find({})
      .select('_id username isActive')
      .lean();
    const totalContributors = contributors.length;
    const activeContributors = contributors.filter((item) => item.isActive).length;

    // Aggregate Question Stats
    const pendingReviews = await ContributorQuestion.countDocuments({ status: 'pending' });
    const totalApproved = await Question.countDocuments({ status: 'approved' });
    const totalRejected = await ContributorQuestion.countDocuments({ status: 'rejected' });

    const contributorQuestionTotalsRaw = await ContributorQuestion.aggregate([
      {
        $group: {
          _id: {
            contributorId: '$contributorId',
            contributorUsername: '$contributorUsername',
          },
          totalQuestions: { $sum: 1 },
          approvedQuestions: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingQuestions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        },
      },
      {
        $project: {
          _id: 0,
          contributorId: { $toString: '$_id.contributorId' },
          contributorUsername: '$_id.contributorUsername',
          totalQuestions: 1,
          approvedQuestions: 1,
          pendingQuestions: 1,
        },
      },
      { $sort: { approvedQuestions: -1, totalQuestions: -1, contributorUsername: 1 } },
    ]);

    const totalsMap = new Map<
      string,
      {
        contributorId: string;
        contributorUsername: string;
        totalQuestions: number;
        approvedQuestions: number;
        pendingQuestions: number;
      }
    >();

    for (const row of contributorQuestionTotalsRaw) {
      if (typeof row.contributorId === 'string') {
        totalsMap.set(row.contributorId, {
          contributorId: row.contributorId,
          contributorUsername: row.contributorUsername,
          totalQuestions: Number(row.totalQuestions) || 0,
          approvedQuestions: Number(row.approvedQuestions) || 0,
          pendingQuestions: Number(row.pendingQuestions) || 0,
        });
      }
    }

    const contributorQuestionTotals = contributors
      .map((contributor) => {
        const contributorId = String(contributor._id);
        const existing = totalsMap.get(contributorId);
        if (existing) return existing;
        return {
          contributorId,
          contributorUsername: contributor.username,
          totalQuestions: 0,
          approvedQuestions: 0,
          pendingQuestions: 0,
        };
      })
      .sort((a, b) => {
        if (b.approvedQuestions !== a.approvedQuestions) return b.approvedQuestions - a.approvedQuestions;
        if (b.totalQuestions !== a.totalQuestions) return b.totalQuestions - a.totalQuestions;
        return a.contributorUsername.localeCompare(b.contributorUsername);
      });

    // Recent Activity
    const recentInstitutions = await Institution.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');

    const recentSubmissions = await ContributorQuestion.find({})
       .sort({ createdAt: -1 })
       .limit(5)
       .select('questionText contributorUsername createdAt status');

    return NextResponse.json({
      stats: {
        institutions: {
          total: totalInstitutions,
          totalFacultySlots,
          totalStudentSlots,
        },
        contributors: {
          total: totalContributors,
          active: activeContributors,
        },
        questions: {
          pending: pendingReviews,
          approved: totalApproved,
          rejected: totalRejected,
        }
      },
      recentActivity: {
        institutions: recentInstitutions,
        submissions: recentSubmissions,
      },
      contributorQuestionTotals,
    });
  } catch (error) {
    console.error('Insights Error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
