import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SmartCandidateResponse from '@/models/SmartCandidateResponse';
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

    await connectDB();

    const reports = await SmartCandidateResponse.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error: any) {
    console.error('[SMART API Reports] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reports.' }, { status: 500 });
  }
}
