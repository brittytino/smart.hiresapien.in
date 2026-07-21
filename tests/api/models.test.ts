/**
 * BUG-02: QuestionBank + PriTestBank models accept 'completed' status
 */
import { describe, it, expect } from 'vitest';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import { VALID_DOMAIN_ID, VALID_DOMAIN_NAME, makeMinimalQuestion, makeMinimalDomainConfig } from '../setup/db-helpers';

const baseBank = {
  title: 'Test Status Bank',
  program: 'MBA',
  createdBy: 'testadmin',
  questions: [makeMinimalQuestion()],
  domains: [makeMinimalDomainConfig()],
};

describe('BUG-02: QuestionBank status enum includes completed', () => {
  it('should save QuestionBank with status: completed', async () => {
    const bank = await QuestionBank.create({ ...baseBank, status: 'completed' });
    expect(bank.status).toBe('completed');
  });

  it('should save QuestionBank with status: draft', async () => {
    const bank = await QuestionBank.create({ ...baseBank, status: 'draft' });
    expect(bank.status).toBe('draft');
  });

  it('should save QuestionBank with status: published', async () => {
    const bank = await QuestionBank.create({ ...baseBank, status: 'published' });
    expect(bank.status).toBe('published');
  });

  it('should reject QuestionBank with invalid status', async () => {
    await expect(
      QuestionBank.create({ ...baseBank, status: 'archived' })
    ).rejects.toThrow();
  });
});

describe('BUG-02: PriTestBank status enum includes completed', () => {
  it('should save PriTestBank with status: completed', async () => {
    const bank = await PriTestBank.create({ ...baseBank, status: 'completed' });
    expect(bank.status).toBe('completed');
  });

  it('should save PriTestBank with status: draft', async () => {
    const bank = await PriTestBank.create({ ...baseBank, status: 'draft' });
    expect(bank.status).toBe('draft');
  });

  it('should save PriTestBank with status: published', async () => {
    const bank = await PriTestBank.create({ ...baseBank, status: 'published' });
    expect(bank.status).toBe('published');
  });

  it('should reject PriTestBank with invalid status', async () => {
    await expect(
      PriTestBank.create({ ...baseBank, status: 'archived' })
    ).rejects.toThrow();
  });
});
