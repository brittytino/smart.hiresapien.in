import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SmartCandidateResponse from '@/models/SmartCandidateResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    const candidateSession = await SmartCandidateResponse.findById(id);
    if (!candidateSession) {
      return NextResponse.json({ error: 'Assessment session not found.' }, { status: 404 });
    }

    return NextResponse.json(candidateSession);
  } catch (error: any) {
    console.error('[SMART API Get Session] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve session.' }, { status: 500 });
  }
}
