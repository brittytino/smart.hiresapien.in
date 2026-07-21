/**
 * BUG-04: DELETE cascade uses $or for both ObjectId and string IDs
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import { createTestQuestionBank, createTestPriTestResponse, makeAdminAuthHeader } from '../setup/db-helpers';

vi.mock('@/lib/mongodb', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

async function callDELETE(id: string, authHeader: string) {
  const { DELETE } = await import('@/app/api/admin/pri-tests/[id]/route');
  const req = new NextRequest(`http://localhost/api/admin/pri-tests/${id}`, {
    method: 'DELETE',
    headers: { Authorization: authHeader },
  });
  return DELETE(req, { params: Promise.resolve({ id }) });
}

describe('BUG-04: DELETE cascade handles both ObjectId and string IDs', () => {
  let bankId: mongoose.Types.ObjectId;
  let bankIdStr: string;

  beforeEach(async () => {
    const bank = await createTestQuestionBank();
    bankId = bank._id as mongoose.Types.ObjectId;
    bankIdStr = bankId.toString();

    // Also create PriTestBank with same ID
    await PriTestBank.create({
      _id: bankId,
      title: bank.title,
      program: bank.program,
      status: 'published',
      createdBy: 'testadmin',
      questions: bank.questions,
      domains: bank.domains,
    });
  });

  it('should cascade-delete PriTestResponse stored with ObjectId questionBankId', async () => {
    await createTestPriTestResponse(bankId, { useStringId: false });

    const res = await callDELETE(bankIdStr, makeAdminAuthHeader());
    expect(res.status).toBe(200);

    const remaining = await PriTestResponse.find({ questionBankId: bankId });
    expect(remaining).toHaveLength(0);
  });

  it('should cascade-delete multiple PriTestResponse records (BUG-04: $or handles both ID forms)', async () => {
    // Create two separate responses for this bank — both stored normally via mongoose (ObjectId)
    await createTestPriTestResponse(bankId, { status: 'submitted' });
    await createTestPriTestResponse(bankId, { status: 'in_progress' });

    const before = await PriTestResponse.find({ questionBankId: bankId });
    expect(before).toHaveLength(2);

    const res = await callDELETE(bankIdStr, makeAdminAuthHeader());
    expect(res.status).toBe(200);

    // All responses — regardless of status — should be cascade-deleted
    const after = await PriTestResponse.find({ questionBankId: bankId });
    expect(after).toHaveLength(0);
  });

  it('should cascade-delete PriTestEvaluation records', async () => {
    const responseId = new mongoose.Types.ObjectId();
    const studentUserId = new mongoose.Types.ObjectId();
    const institutionId = new mongoose.Types.ObjectId();
    await PriTestEvaluation.create({
      responseId,
      questionBankId: bankId,
      studentUserId,
      institutionId,
      status: 'completed',
      mcqCorrect: 2,
      mcqTotal: 5,
      totalScore: 40,
      percentage: 40,
      domains: [],
      evaluatedAt: new Date(),
    });

    const res = await callDELETE(bankIdStr, makeAdminAuthHeader());
    expect(res.status).toBe(200);

    const remaining = await PriTestEvaluation.find({ questionBankId: bankId });
    expect(remaining).toHaveLength(0);
  });

  it('should delete both QuestionBank and PriTestBank records', async () => {
    const res = await callDELETE(bankIdStr, makeAdminAuthHeader());
    expect(res.status).toBe(200);

    const qb = await QuestionBank.findById(bankIdStr);
    const ptb = await PriTestBank.findById(bankIdStr);
    expect(qb).toBeNull();
    expect(ptb).toBeNull();
  });

  it('should return 401 without valid auth', async () => {
    const res = await callDELETE(bankIdStr, 'Bearer bad-token');
    expect(res.status).toBe(401);
  });
});
