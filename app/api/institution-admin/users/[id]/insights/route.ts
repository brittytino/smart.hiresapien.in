import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import ContributorQuestion from '@/models/ContributorQuestion';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';
import mongoose from 'mongoose';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const admin = getInstitutionAdminFromAuthHeader(req.headers.get('Authorization'));
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    await connectDB();

    const user = await UserAccount.findOne({
      _id: id,
      institutionId: admin.institutionId
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stats = await ContributorQuestion.aggregate([
      { $match: { contributorUsername: user.username } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      }
    ]);

    const recentSubmissions = await ContributorQuestion.find({ contributorUsername: user.username })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('domain subSkill status createdAt questionText');

    return NextResponse.json({
      user: {
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      insights: stats[0] || {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
      },
      recentActivity: recentSubmissions
    });

  } catch (error) {
    console.error('Faculty Insights API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
