import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import { getContributorFromAuthHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const contributor = getContributorFromAuthHeader(req.headers.get('Authorization'));
    if (!contributor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const user = await UserAccount.findById(contributor.id).select('fullName username role').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        fullName: user.fullName || user.username || 'Contributor',
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Contributor Profile API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
