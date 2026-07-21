/**
 * BUG-28: GET /evaluate returns valid numbers — no NaN or Infinity
 * Fix: e.percentage ?? 0 in reducer; isFinite(totalScore) guard
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import { createTestPriTestBank, createTestEvaluation, makeAdminAuthHeader } from '../setup/db-helpers';

vi.mock('@/lib/mongodb', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

async function callGET(id: string, authHeader: string) {
  const { GET } = await import('@/app/api/admin/pri-tests/[id]/evaluate/route');
  const req = new NextRequest(`http://localhost/api/admin/pri-tests/${id}/evaluate`, {
    method: 'GET',
    headers: { Authorization: authHeader },
  });
  return GET(req, { params: Promise.resolve({ id }) });
}

describe('BUG-28: GET /evaluate returns valid numeric avgScore (no NaN)', () => {
  let bankId: mongoose.Types.ObjectId;
  let bankIdStr: string;

  beforeEach(async () => {
    const bank = await createTestPriTestBank();
    bankId = bank._id as mongoose.Types.ObjectId;
    bankIdStr = bankId.toString();
  });

  it('should return avgScore 0 when no evaluations exist', async () => {
    const res = await callGET(bankIdStr, makeAdminAuthHeader());
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.avgScore).toBe(0);
    expect(Number.isNaN(data.avgScore)).toBe(false);
  });

  it('should compute correct avgScore from two evaluations (80 + 60 = 70)', async () => {
    await createTestEvaluation(bankId, 80);
    await createTestEvaluation(bankId, 60);

    const res = await callGET(bankIdStr, makeAdminAuthHeader());
    const data = await res.json();

    expect(data.avgScore).toBeCloseTo(70, 1);
    expect(Number.isNaN(data.avgScore)).toBe(false);
    expect(Number.isFinite(data.avgScore)).toBe(true);
  });

  it('should handle null percentage gracefully (BUG-28 fix: e.percentage ?? 0)', async () => {
    // Bypass mongoose validation to simulate a document with null percentage
    // (simulates legacy data that triggered the original bug)
    await PriTestEvaluation.collection.insertOne({
      responseId: new mongoose.Types.ObjectId(),
      questionBankId: bankId,
      studentUserId: new mongoose.Types.ObjectId(),
      institutionId: new mongoose.Types.ObjectId(),
      status: 'completed',
      mcqCorrect: 2,
      mcqTotal: 4,
      totalScore: 50,
      percentage: null, // null — the bug scenario
      domains: [],
      evaluatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await callGET(bankIdStr, makeAdminAuthHeader());
    const data = await res.json();

    // Should NOT be NaN even with null percentage
    expect(Number.isNaN(data.avgScore)).toBe(false);
    expect(Number.isFinite(data.avgScore)).toBe(true);
  });

  it('should return no NaN or Infinity values in the response body', async () => {
    await createTestEvaluation(bankId, 75);
    await createTestEvaluation(bankId, 85);

    const res = await callGET(bankIdStr, makeAdminAuthHeader());
    const data = await res.json();

    const checkNoNaN = (value: unknown): void => {
      if (typeof value === 'number') {
        expect(Number.isNaN(value)).toBe(false);
        expect(Number.isFinite(value)).toBe(true);
      } else if (Array.isArray(value)) {
        value.forEach(checkNoNaN);
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(checkNoNaN);
      }
    };

    checkNoNaN(data);
  });

  it('should return 401 without valid auth', async () => {
    const res = await callGET(bankIdStr, 'Bearer invalid');
    expect(res.status).toBe(401);
  });
});
