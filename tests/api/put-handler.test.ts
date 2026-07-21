/**
 * BUG-03: PUT handler syncs status to BOTH QuestionBank AND PriTestBank
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import { createTestQuestionBank, makeAdminAuthHeader } from '../setup/db-helpers';

// Mock connectDB so the handler uses our in-memory connection
vi.mock('@/lib/mongodb', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

async function callPUT(id: string, body: Record<string, unknown>, authHeader: string) {
  const { PUT } = await import('@/app/api/admin/pri-tests/[id]/route');
  const req = new NextRequest(`http://localhost/api/admin/pri-tests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });
  return PUT(req, { params: Promise.resolve({ id }) });
}

describe('BUG-03: PUT handler syncs status to PriTestBank', () => {
  let bankId: string;

  beforeEach(async () => {
    const bank = await createTestQuestionBank({ status: 'published' });
    bankId = bank._id.toString();
    // Seed PriTestBank with same id to simulate existing record
    await PriTestBank.create({
      _id: bank._id,
      title: bank.title,
      program: bank.program,
      status: 'published',
      createdBy: 'testadmin',
      questions: bank.questions,
      domains: bank.domains,
    });
  });

  it('should update QuestionBank status to completed', async () => {
    const res = await callPUT(bankId, { status: 'completed' }, makeAdminAuthHeader());
    expect(res.status).toBe(200);

    const updated = await QuestionBank.findById(bankId);
    expect(updated?.status).toBe('completed');
  });

  it('should also update PriTestBank status to completed (BUG-03 fix)', async () => {
    await callPUT(bankId, { status: 'completed' }, makeAdminAuthHeader());

    const priBank = await PriTestBank.findById(bankId);
    expect(priBank?.status).toBe('completed');
  });

  it('should sync status: published to both banks', async () => {
    // First set to draft
    await callPUT(bankId, { status: 'draft' }, makeAdminAuthHeader());
    // Then set back to published
    await callPUT(bankId, { status: 'published' }, makeAdminAuthHeader());

    const qb = await QuestionBank.findById(bankId);
    const ptb = await PriTestBank.findById(bankId);
    expect(qb?.status).toBe('published');
    expect(ptb?.status).toBe('published');
  });

  it('should return 401 without auth', async () => {
    const res = await callPUT(bankId, { status: 'completed' }, 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});
