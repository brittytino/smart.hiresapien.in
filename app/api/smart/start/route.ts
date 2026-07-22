import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SmartCandidateResponse from '@/models/SmartCandidateResponse';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { fullName, email, phone, age, gender } = body;

    if (!fullName || !email || !phone || !age || !gender) {
      return NextResponse.json({ error: 'All demographic details are required.' }, { status: 400 });
    }

    const newResponse = new SmartCandidateResponse({
      fullName,
      email,
      phone,
      age: Number(age),
      gender,
      status: 'in_progress',
      startedAt: new Date(),
      answers: [],
    });

    await newResponse.save();

    return NextResponse.json({
      success: true,
      id: newResponse._id,
      message: 'Assessment session started successfully.',
    });
  } catch (error: any) {
    console.error('[SMART API Start] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start session.' }, { status: 500 });
  }
}
