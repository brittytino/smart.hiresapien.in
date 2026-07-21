import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import { fetchQuestionBankQuestionsFromDB } from '@/lib/question-bank-generator';
import { getAdminFromAuthHeader } from '@/lib/auth';

function sumEquals100(values: number[]): boolean {
  const total = values.reduce((acc, value) => acc + value, 0);
  return Math.abs(total - 100) < 0.001;
}

function normalizeNumber(input: unknown): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input === 'string' && input.trim() !== '' && !Number.isNaN(Number(input))) {
    return Number(input);
  }
  return NaN;
}

function parseTimeToMinutes(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function parseDomains(payload: unknown) {
  if (!Array.isArray(payload)) return { error: 'domains must be an array' } as const;

  const domains = payload
    .map((domain) => {
      if (typeof domain !== 'object' || domain === null) return null;
      const record = domain as Record<string, unknown>;
      const domainId = typeof record.domainId === 'string' ? record.domainId : '';
      const domainName = typeof record.domainName === 'string' ? record.domainName.trim() : '';
      const domainShare = normalizeNumber(record.domainShare);
      const domainStartTime = typeof record.domainStartTime === 'string' ? record.domainStartTime : '';
      const domainEndTime = typeof record.domainEndTime === 'string' ? record.domainEndTime : '';
      const subskillsInput = Array.isArray(record.subskills) ? record.subskills : [];

      const subskills = subskillsInput
        .map((sub) => {
          if (typeof sub !== 'object' || sub === null) return null;
          const subRecord = sub as Record<string, unknown>;
          const name = typeof subRecord.name === 'string' ? subRecord.name.trim() : '';
          const share = normalizeNumber(subRecord.share);
          const priContribution = normalizeNumber(subRecord.priContribution);
          const questionCount = normalizeNumber(subRecord.questionCount);
          const questionType = subRecord.questionType === 'written' ? 'written' : 'mcq';
          const difficultyShareRaw = typeof subRecord.difficultyShare === 'object' && subRecord.difficultyShare !== null
            ? (subRecord.difficultyShare as Record<string, unknown>)
            : null;

          const difficultyShare = {
            easy: normalizeNumber(difficultyShareRaw?.easy ?? 34),
            medium: normalizeNumber(difficultyShareRaw?.medium ?? 33),
            hard: normalizeNumber(difficultyShareRaw?.hard ?? 33),
          };

          if (
            !name ||
            Number.isNaN(share) ||
            Number.isNaN(priContribution) ||
            Number.isNaN(questionCount) ||
            Number.isNaN(difficultyShare.easy) ||
            Number.isNaN(difficultyShare.medium) ||
            Number.isNaN(difficultyShare.hard)
          ) {
            return null;
          }

          const difficultyTotal = difficultyShare.easy + difficultyShare.medium + difficultyShare.hard;
          if (difficultyTotal < 0) {
            return null;
          }

          return {
            name,
            share,
            priContribution,
            questionCount,
            questionType,
            difficultyShare: difficultyShare || { easy: 0, medium: 0, hard: 0 },
          };
        })
        .filter(Boolean);

      const startMinutes = parseTimeToMinutes(domainStartTime);
      const endMinutes = parseTimeToMinutes(domainEndTime);

      if (!domainId || Number.isNaN(domainShare)) return null;
      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return null;

      return {
        domainId,
        domainName: domainName || domainId,
        domainShare,
        domainStartTime,
        domainEndTime,
        subskills,
      };
    })
    .filter(Boolean) as Array<{
      domainId: string;
      domainName: string;
      domainShare: number;
      domainStartTime: string;
      domainEndTime: string;
      subskills: Array<{
        name: string;
        share: number;
        priContribution: number;
        questionCount: number;
        questionType: 'mcq' | 'written';
        difficultyShare: {
          easy: number;
          medium: number;
          hard: number;
        };
      }>;
    }>;

  if (domains.length === 0) {
    return { error: 'At least one domain is required' } as const;
  }

  for (const domain of domains) {
    if (domain.subskills.length === 0) {
      return { error: `At least one subskill is required for ${domain.domainName}` } as const;
    }

    if (domain.domainId !== 'workspace-psychology' && !sumEquals100(domain.subskills.map((s) => s.share))) {
      return { error: `Subskill shares must sum to 100 for ${domain.domainName}` } as const;
    }

    const invalidCount = domain.subskills.find((s) => s.questionCount < 1 || Number.isNaN(s.questionCount));
    if (invalidCount) {
      return { error: `Each subskill question_count must be at least 1 for ${domain.domainName}` } as const;
    }

    const invalidDifficulty = domain.subskills.find((s) => {
      // difficultyShare is only required/present if questionType is 'mcq'
      if (s.questionType !== 'mcq') return false;
      const share = (s as any).difficultyShare;
      if (!share) return true; // Missing share when it should have one
      const total = share.easy + share.medium + share.hard;
      return typeof total !== 'number' || isNaN(total) || total < 0;
    });
    if (invalidDifficulty) {
      return { error: `Difficulty counts empty or invalid for ${domain.domainName}` } as const;
    }
  }

  if (!sumEquals100(domains.map((d) => d.domainShare))) {
    return { error: 'Domain shares must sum to 100' } as const;
  }

  return { domains } as const;
}

/**
 * GET /api/admin/pri-tests
 * Admin: list PRI question banks.
 */
export async function GET(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const [banks, priTestBanks] = await Promise.all([
      QuestionBank.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $addFields: {
            questionCount: { $size: { $ifNull: ['$questions', []] } },
          },
        },
        { $project: { questions: 0, domains: 0 } },
      ]),
      PriTestBank.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $addFields: {
            questionCount: { $size: { $ifNull: ['$questions', []] } },
          },
        },
        { $project: { questions: 0, domains: 0 } },
      ]),
    ]);
    return NextResponse.json({ banks, priTestBanks }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/pri-tests]', error);
    return NextResponse.json({ error: 'Failed to fetch PRI tests' }, { status: 500 });
  }
}

/**
 * POST /api/admin/pri-tests
 * Admin: generate a draft PRI question bank.
 */
export async function POST(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const program = typeof body.program === 'string' ? body.program.trim() : '';

  if (!title || !program) {
    return NextResponse.json({ error: 'title and program are required' }, { status: 400 });
  }

  const parsed = parseDomains(body.domains);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  let questions;
  try {
    questions = await fetchQuestionBankQuestionsFromDB({ program, domains: parsed.domains });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    await connectDB();

    const bank = await QuestionBank.create({
      title,
      program,
      status: 'draft',
      domains: parsed.domains,
      questions,
      institutions: [],
      createdBy: admin.username,
    });

    await PriTestBank.findOneAndUpdate(
      { _id: bank._id },
      {
        _id: bank._id,
        title,
        program,
        status: 'draft',
        domains: parsed.domains,
        questions,
        institutions: [],
        createdBy: admin.username,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return NextResponse.json({ bank }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/pri-tests]', error);
    return NextResponse.json({ error: 'Failed to create PRI test' }, { status: 500 });
  }
}
