/**
 * BUG-05: POST /api/admin/pri-tests/[id]/evaluate endpoint exists and works
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import {
  createTestPriTestBank,
  createTestPriTestResponse,
  makeAdminAuthHeader,
  makeMinimalQuestion,
} from '../setup/db-helpers';

vi.mock('@/lib/mongodb', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

async function callPOST(id: string, authHeader: string) {
  const { POST } = await import('@/app/api/admin/pri-tests/[id]/evaluate/route');
  const req = new NextRequest(`http://localhost/api/admin/pri-tests/${id}/evaluate`, {
    method: 'POST',
    headers: { Authorization: authHeader },
  });
  return POST(req, { params: Promise.resolve({ id }) });
}

describe('BUG-05: POST /evaluate endpoint exists and scores responses', () => {
  let bankId: mongoose.Types.ObjectId;
  let bankIdStr: string;

  beforeEach(async () => {
    const bank = await createTestPriTestBank();
    bankId = bank._id as mongoose.Types.ObjectId;
    bankIdStr = bankId.toString();
  });

  it('should return status 200 even with no submitted responses', async () => {
    const res = await callPOST(bankIdStr, makeAdminAuthHeader());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.evaluated).toBe(0);
  });

  it('should evaluate submitted responses and return evaluated count', async () => {
    const bank = await createTestPriTestBank();
    const id = bank._id.toString();

    // Create two submitted responses
    await createTestPriTestResponse(bank._id, { status: 'submitted' });
    await createTestPriTestResponse(bank._id, { status: 'submitted' });

    const res = await callPOST(id, makeAdminAuthHeader());
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.evaluated).toBe(2);
    expect(typeof data.avgScore).toBe('number');
    expect(Number.isFinite(data.avgScore)).toBe(true);
  });

  it('should NOT evaluate in_progress responses', async () => {
    const bank = await createTestPriTestBank();
    const id = bank._id.toString();

    await createTestPriTestResponse(bank._id, { status: 'in_progress' });

    const res = await callPOST(id, makeAdminAuthHeader());
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.evaluated).toBe(0);
  });

  it('should upsert PriTestEvaluation documents', async () => {
    const bank = await createTestPriTestBank();
    const id = bank._id.toString();
    await createTestPriTestResponse(bank._id, { status: 'submitted' });

    await callPOST(id, makeAdminAuthHeader());

    const evaluations = await PriTestEvaluation.find({ questionBankId: bank._id });
    expect(evaluations.length).toBeGreaterThan(0);
  });

  it('should return 401 without valid auth', async () => {
    const res = await callPOST(bankIdStr, 'Bearer bad-token');
    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid id', async () => {
    const res = await callPOST('not-a-valid-objectid', makeAdminAuthHeader());
    expect(res.status).toBe(400);
  });

  it('should return avgScore as finite number (not NaN)', async () => {
    const bank = await createTestPriTestBank();
    const id = bank._id.toString();
    await createTestPriTestResponse(bank._id, { status: 'submitted' });

    const res = await callPOST(id, makeAdminAuthHeader());
    const data = await res.json();

    expect(Number.isNaN(data.avgScore)).toBe(false);
    expect(Number.isFinite(data.avgScore)).toBe(true);
    expect(data.avgScore).toBeGreaterThanOrEqual(0);
    expect(data.avgScore).toBeLessThanOrEqual(100);
  });
});
