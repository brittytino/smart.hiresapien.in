/**
 * BUG-37: Student API caps questions per domain by questionCount (no 100+ q overflow)
 * BUG-25: Student API does NOT filter by domain time slots (serves all questions always)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse from '@/models/PriTestResponse';
import { signToken, signAdminToken } from '@/lib/auth';

vi.mock('@/lib/mongodb', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/models/UserAccount', () => ({
  default: {
    findById: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({ studentId: 'S001', fullName: 'Test Student' }),
    }),
  },
}));

const INST_ID = new mongoose.Types.ObjectId();
const STUDENT_ID = new mongoose.Types.ObjectId();

function makeStudentToken() {
  return signToken({
    role: 'student',
    id: STUDENT_ID.toString(),
    username: 'teststudent',
    institutionId: INST_ID.toString(),
    expiresInSeconds: 86400,
  });
}

async function callStudentGET(authHeader: string) {
  const { GET } = await import('@/app/api/student/pri-test/route');
  const req = new NextRequest('http://localhost/api/student/pri-test', {
    method: 'GET',
    headers: { Authorization: authHeader },
  });
  return GET(req);
}

async function createActiveBankWithQuestions(
  domainId: string,
  questionCount: number,
  subskillQuestionCount: number
) {
  const institutionId = INST_ID;
  const questions = Array.from({ length: questionCount }, (_, i) => ({
    domainId,
    domainName: 'Cognitive Intelligence',
    subSkill: 'Logical Reasoning - Syllogisms',
    questionType: 'mcq' as const,
    difficulty: 'medium' as const,
    questionText: `Question ${i + 1} about logical reasoning for testing purposes here.`,
    options: [
      { label: 'A', text: 'Option A' },
      { label: 'B', text: 'Option B' },
      { label: 'C', text: 'Option C' },
      { label: 'D', text: 'Option D' },
    ],
    correctAnswer: 'A',
  }));

  const bank = await PriTestBank.create({
    title: 'Student API Test Bank',
    program: 'MBA',
    status: 'published',
    createdBy: 'testadmin',
    questions,
    domains: [
      {
        domainId,
        domainName: 'Cognitive Intelligence',
        domainShare: 25,
        domainStartTime: '08:00',
        domainEndTime: '09:00',
        subskills: [
          {
            name: 'Logical Reasoning - Syllogisms',
            share: 100,
            priContribution: 25,
            questionCount: subskillQuestionCount, // the cap
            questionType: 'mcq' as const,
            difficultyShare: { easy: 30, medium: 50, hard: 20 },
          },
        ],
      },
    ],
    institutions: [
      {
        institutionId,
        status: 'accepted',
        examStartDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // started 2h ago
        examEndDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // ends in 2h
        sharedAt: new Date(),
      },
    ],
  });

  return bank;
}

describe('BUG-37: Student API caps questions per domain by questionCount', () => {
  beforeEach(async () => {
    await PriTestBank.deleteMany({});
    await PriTestResponse.deleteMany({});
  });

  it('should serve at most questionCount questions per domain even when more exist', async () => {
    const CAP = 3;
    const ACTUAL_COUNT = 10;
    await createActiveBankWithQuestions('cognitive-intelligence', ACTUAL_COUNT, CAP);

    const res = await callStudentGET(`Bearer ${makeStudentToken()}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    const domainQs = (data.questions ?? []).filter(
      (q: { domainId: string }) => q.domainId === 'cognitive-intelligence'
    );
    expect(domainQs.length).toBeLessThanOrEqual(CAP);
    // The BUG would have served all 10 — now it should be capped at 3
    expect(domainQs.length).not.toBe(ACTUAL_COUNT);
  });

  it('should serve exactly questionCount questions when bank has exactly that many', async () => {
    const CAP = 5;
    await createActiveBankWithQuestions('cognitive-intelligence', CAP, CAP);

    const res = await callStudentGET(`Bearer ${makeStudentToken()}`);
    const data = await res.json();
    const domainQs = (data.questions ?? []).filter(
      (q: { domainId: string }) => q.domainId === 'cognitive-intelligence'
    );
    expect(domainQs.length).toBe(CAP);
  });
});

describe('BUG-25: Student API does not filter by domain time slots', () => {
  beforeEach(async () => {
    await PriTestBank.deleteMany({});
    await PriTestResponse.deleteMany({});
  });

  it('should serve questions from domains whose time slot has passed', async () => {
    // Create bank with a domain time slot that ENDED in the past
    const institutionId = INST_ID;
    const bank = await PriTestBank.create({
      title: 'Past Domain Test Bank',
      program: 'MBA',
      status: 'published',
      createdBy: 'testadmin',
      questions: [
        {
          domainId: 'cognitive-intelligence',
          domainName: 'Cognitive Intelligence',
          subSkill: 'Logical Reasoning - Syllogisms',
          questionType: 'mcq' as const,
          difficulty: 'medium' as const,
          questionText: 'A question with a past time slot for the domain test.',
          options: [
            { label: 'A', text: 'Option A' },
            { label: 'B', text: 'Option B' },
          ],
          correctAnswer: 'A',
        },
      ],
      domains: [
        {
          domainId: 'cognitive-intelligence',
          domainName: 'Cognitive Intelligence',
          domainShare: 25,
          domainStartTime: '06:00', // Started at 06:00 (past)
          domainEndTime: '07:00',   // Ended at 07:00 (past)
          subskills: [
            {
              name: 'Logical Reasoning - Syllogisms',
              share: 100,
              priContribution: 25,
              questionCount: 5,
              questionType: 'mcq' as const,
              difficultyShare: { easy: 30, medium: 50, hard: 20 },
            },
          ],
        },
      ],
      institutions: [
        {
          institutionId,
          status: 'accepted',
          examStartDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
          examEndDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // exam still active
          sharedAt: new Date(),
        },
      ],
    });

    const res = await callStudentGET(`Bearer ${makeStudentToken()}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    // BUG-25 fix: questions should still be returned even if domain time slot is "past"
    expect(Array.isArray(data.questions)).toBe(true);
    expect(data.questions.length).toBeGreaterThan(0);
    expect(data.code).not.toBe('NO_ACTIVE_TEST');
  });

  it('should return ALREADY_SUBMITTED when student already submitted', async () => {
    await createActiveBankWithQuestions('cognitive-intelligence', 3, 3);
    const bank = await PriTestBank.findOne({ status: 'published' });
    if (!bank) return;

    // Create a submitted response for this student
    await PriTestResponse.create({
      questionBankId: bank._id,
      studentUserId: STUDENT_ID,
      institutionId: INST_ID,
      status: 'submitted',
      evaluationStatus: 'pending',
      answers: [],
      startedAt: new Date(),
      lastActiveAt: new Date(),
    });

    const res = await callStudentGET(`Bearer ${makeStudentToken()}`);
    const data = await res.json();
    expect(data.code).toBe('ALREADY_SUBMITTED');
  });
});
