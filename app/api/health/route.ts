/**
 * GET /api/health
 * System health check — MongoDB ping + AI router status.
 * Port of Python GET /health from both services.
 */
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getRouterStatus } from '@/lib/ai/ai-router';
import mongoose from 'mongoose';

export async function GET() {
  let mongoStatus = 'ok';
  try {
    await connectDB();
    await mongoose.connection.db?.command({ ping: 1 });
  } catch (err: any) {
    mongoStatus = `error: ${err.message}`;
  }

  return NextResponse.json({
    status:          'ok',
    version:         '4.0.0',
    mongo:           mongoStatus,
    architecture:    'consolidated — single Next.js process on port 3000',
    ...getRouterStatus(),
  });
}
