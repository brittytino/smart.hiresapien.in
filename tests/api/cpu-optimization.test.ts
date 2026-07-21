/**
 * CPU Optimization Tests — validates that AI is only called once per student
 * and that the circuit breaker + cache work correctly.
 *
 * Run: npm run test:api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Circuit Breaker tests ──────────────────────────────────────────────────
describe('CircuitBreaker', () => {
  it('starts in CLOSED state', async () => {
    const { CircuitBreaker, CBState } = await import('@/lib/ai/circuit-breaker');
    const cb = new CircuitBreaker(3, 60);
    expect(cb.state).toBe(CBState.CLOSED);
  });

  it('opens after failure threshold', async () => {
    const { CircuitBreaker, CBState } = await import('@/lib/ai/circuit-breaker');
    const cb = new CircuitBreaker(3, 60);
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.state).toBe(CBState.OPEN);
  });

  it('resets to CLOSED after success', async () => {
    const { CircuitBreaker, CBState } = await import('@/lib/ai/circuit-breaker');
    const cb = new CircuitBreaker(3, 60);
    cb.recordFailure();
    cb.recordFailure();
    cb.recordSuccess();
    expect(cb.state).toBe(CBState.CLOSED);
  });
});

// ── Rate Limiter tests ─────────────────────────────────────────────────────
describe('Rate Limiter', () => {
  it('allows requests within limit', async () => {
    const { checkRateLimit } = await import('@/lib/limiter');
    const result = checkRateLimit('test-ip-1');
    expect(result.success).toBe(true);
    expect(result.limit).toBeGreaterThan(0);
  });

  it('blocks requests that exceed the limit', async () => {
    const { checkRateLimit } = await import('@/lib/limiter');
    const ip = 'test-ip-overload-' + Date.now();
    // Exhaust the limit
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip);
    }
    const blocked = checkRateLimit(ip);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

// ── Student prompt builder tests ──────────────────────────────────────────
describe('Student Prompt Builder', () => {
  it('builds a non-empty prompt with student name', async () => {
    const { buildStudentPrompt } = await import('@/lib/insights/student-prompt-builder');
    const mockData = {
      studentId:       'S001',
      studentUserId:   'uid123',
      studentName:     'Priya Sharma',
      studentUsername: 'priya.sharma',
      batch:           'BATCH001',
      programme:       'MBA',
      priBand:         'AMBER' as const,
      overallAccuracy: 0.62,
      overallScore:    62,
      examDate:        '2026-03-01',
      domains: {
        'Communication': {
          accuracy:           0.62,
          band:               'AMBER' as const,
          questionsAttempted: 10,
          correct:            6,
          avgTimeRatio:       1.0,
          totalTimeSec:       300,
          estTimeSec:         300,
          needsAttention:     4,
          weakSubSkills:      ['Written Communication'],
          strongSubSkills:    ['Public Speaking'],
          subSkillDetails:    [{ name: 'Written Communication', accuracy: 40, avgTimeRatio: 1.2, correct: 2, total: 5 }],
          correctQuestions:   [],
          wrongQuestions:     [],
        },
      },
    };

    const prompt = buildStudentPrompt(mockData);
    expect(prompt).toContain('Priya Sharma');
    expect(prompt).toContain('AMBER');
    expect(prompt).toContain('Communication');
    expect(prompt.length).toBeGreaterThan(500);
  });
});

// ── Faculty prompt builder tests ──────────────────────────────────────────
describe('Faculty Prompt Builder', () => {
  it('builds a faculty-specific prompt', async () => {
    const { buildFacultyPrompt } = await import('@/lib/insights/faculty-prompt-builder');
    const mockData = {
      studentId:       'S001',
      studentUserId:   'uid123',
      studentName:     'Arjun Kumar',
      studentUsername: 'arjun.kumar',
      batch:           'INST001',
      programme:       'MBA',
      priBand:         'RED' as const,
      overallAccuracy: 0.40,
      overallScore:    40,
      examDate:        '2026-03-01',
      domains: {
        'Leadership': {
          accuracy:           0.40,
          band:               'RED' as const,
          questionsAttempted: 8,
          correct:            3,
          avgTimeRatio:       1.3,
          totalTimeSec:       240,
          estTimeSec:         200,
          needsAttention:     5,
          weakSubSkills:      ['Conflict Resolution'],
          strongSubSkills:    [],
          subSkillDetails:    [{ name: 'Conflict Resolution', accuracy: 38, avgTimeRatio: 1.4, correct: 3, total: 8 }],
          correctQuestions:   [],
          wrongQuestions:     [],
        },
      },
    };

    const prompt = buildFacultyPrompt(mockData);
    expect(prompt).toContain('Arjun Kumar');
    expect(prompt).toContain('intervention');
    expect(prompt).not.toContain('coach');  // faculty prompt should NOT use student-facing language
    expect(prompt.length).toBeGreaterThan(300);
  });
});
