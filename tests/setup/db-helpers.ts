import mongoose from 'mongoose';
import { signAdminToken } from '@/lib/auth';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import StudentResponse from '@/models/StudentResponse';

export { signAdminToken };

export function makeAdminAuthHeader(): string {
  const token = signAdminToken('testadmin');
  return `Bearer ${token}`;
}

// Valid domain IDs from lib/domains.ts
export const VALID_DOMAIN_ID = 'cognitive-intelligence';
export const VALID_DOMAIN_NAME = 'Cognitive Intelligence';

export function makeMinimalQuestion(overrides: Record<string, unknown> = {}) {
  return {
    domainId: VALID_DOMAIN_ID,
    domainName: VALID_DOMAIN_NAME,
    subSkill: 'Logical Reasoning - Syllogisms',
    questionType: 'mcq' as const,
    difficulty: 'medium' as const,
    questionText: 'What is the capital of France? This question is long enough.',
    options: [
      { label: 'A', text: 'London' },
      { label: 'B', text: 'Paris' },
      { label: 'C', text: 'Berlin' },
      { label: 'D', text: 'Rome' },
    ],
    correctAnswer: 'B',
    ...overrides,
  };
}

export function makeMinimalDomainConfig() {
  return {
    domainId: VALID_DOMAIN_ID,
    domainName: VALID_DOMAIN_NAME,
    domainShare: 25,
    domainStartTime: '08:00',
    domainEndTime: '09:00',
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
  };
}

export async function createTestQuestionBank(overrides: Record<string, unknown> = {}) {
  const bankData = {
    title: 'Test Bank ' + Date.now(),
    program: 'MBA',
    status: 'published',
    createdBy: 'testadmin',
    questions: [makeMinimalQuestion()],
    domains: [makeMinimalDomainConfig()],
    ...overrides,
  };
  return QuestionBank.create(bankData);
}

export async function createTestPriTestBank(overrides: Record<string, unknown> = {}) {
  const bankData = {
    title: 'Test PRI Bank ' + Date.now(),
    program: 'MBA',
    status: 'published',
    createdBy: 'testadmin',
    questions: [makeMinimalQuestion()],
    domains: [makeMinimalDomainConfig()],
    ...overrides,
  };
  return PriTestBank.create(bankData);
}

export async function createTestPriTestResponse(
  questionBankId: mongoose.Types.ObjectId | string,
  options: {
    status?: 'in_progress' | 'submitted';
    useStringId?: boolean;
    answers?: any[];
  } = {}
) {
  const { status = 'submitted', useStringId = false, answers = [] } = options;
  const studentUserId = new mongoose.Types.ObjectId();
  const institutionId = new mongoose.Types.ObjectId();

  return PriTestResponse.create({
    questionBankId: useStringId ? questionBankId.toString() : new mongoose.Types.ObjectId(questionBankId.toString()),
    studentUserId,
    institutionId,
    status,
    evaluationStatus: 'pending',
    answers,
    startedAt: new Date(),
    lastActiveAt: new Date(),
  });
}

export async function createTestEvaluation(
  questionBankId: mongoose.Types.ObjectId,
  percentage: number | null
) {
  const responseId = new mongoose.Types.ObjectId();
  const studentUserId = new mongoose.Types.ObjectId();
  const institutionId = new mongoose.Types.ObjectId();

  return PriTestEvaluation.create({
    responseId,
    questionBankId,
    studentUserId,
    institutionId,
    status: 'completed',
    mcqCorrect: 3,
    mcqTotal: 5,
    totalScore: percentage ?? 0,
    percentage: percentage ?? 0,
    domains: [],
    evaluatedAt: new Date(),
  });
}

export async function createTestStudentResponse(
  testBankId: mongoose.Types.ObjectId | string,
  useStringId = false
) {
  const StudentResponseModel = StudentResponse;
  const studentUserId = new mongoose.Types.ObjectId();
  const institutionId = new mongoose.Types.ObjectId();

  return StudentResponseModel.create({
    testBankId: useStringId ? testBankId.toString() : new mongoose.Types.ObjectId(testBankId.toString()),
    studentUserId,
    institutionId,
    status: 'submitted',
    responses: [],
  });
}
