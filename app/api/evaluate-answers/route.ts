import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/limiter';
import { runAIEvaluation } from '@/lib/evaluation-engine';

function handleRateLimit(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, remaining, limit } = checkRateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString()
      }
    });
  }
  return null; // OK
}

export async function GET(req: Request) {
  const rl = handleRateLimit(req);
  if (rl) return rl;
  const result = await runAIEvaluation();
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const rl = handleRateLimit(req);
  if (rl) return rl;
  const result = await runAIEvaluation();
  return NextResponse.json(result);
}
