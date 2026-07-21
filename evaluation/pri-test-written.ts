import type { IQuestionBank } from '@/models/QuestionBank';
import type { IPriTestResponse } from '@/models/PriTestResponse';

export interface WrittenSubskillScore {
  name: string;
  share: number;
  priContribution: number;
  answered: number;
  correct: number; // For written, this represents the "effective correct" based on AI score
  total: number;
  score: number;
  aiAverageScore: number; // Raw AI average score (0-100)
}

export interface WrittenDomainScore {
  domainId: string;
  domainName: string;
  domainShare: number;
  answered: number;
  correct: number;
  total: number;
  score: number;
  subskills: WrittenSubskillScore[];
}

export interface WrittenEvaluationResult {
  writtenAnswered: number;
  writtenTotal: number;
  totalScore: number;
  percentage: number;
  domains: WrittenDomainScore[];
}

// Truncate to single decimal place without rounding
function truncateToOneDecimal(value: number) {
  return Math.trunc(value * 10) / 10;
}

/**
 * Evaluates written task responses using AI evaluation scores stored in
 * PriTestResponse.answers[].aiEvaluation.
 *
 * The scoring formula mirrors MCQ evaluation:
 *   ratio = averageScore / 100  (AI score normalised to 0–1)
 *   subskillScore = round(priContribution × ratio, 2)
 */
export function evaluateWrittenResponse(
  bank: IQuestionBank,
  response: IPriTestResponse,
): WrittenEvaluationResult {
  // 1. Map written questions from the bank by domainId::subSkill
  const writtenTotals = new Map<string, number>();
  const questionIndexMap = new Map<number, (typeof bank.questions)[number]>();

  (bank.questions ?? []).forEach((question, index) => {
    if (question.questionType !== 'written') return;
    const key = `${question.domainId}::${question.subSkill ?? ''}`;
    writtenTotals.set(key, (writtenTotals.get(key) ?? 0) + 1);
    questionIndexMap.set(index, question);
  });

  // 2. Aggregate AI scores from student answers
  const aiScoresByKey = new Map<string, number[]>();
  const answeredByKey = new Map<string, number>();
  let writtenAnswered = 0;

  (response.answers ?? []).forEach((answer) => {
    if (answer.questionType !== 'written') return;

    const question = questionIndexMap.get(answer.questionIndex);
    if (!question) return;

    const subSkill = question.subSkill ?? '';
    const key = `${question.domainId}::${subSkill}`;

    // Only count answers that have text AND an AI evaluation
    const hasAnswer = (answer.answerText && answer.answerText.trim().length > 0) ||
                      (answer.studentAnswer && answer.studentAnswer.trim().length > 0);

    if (hasAnswer) {
      answeredByKey.set(key, (answeredByKey.get(key) ?? 0) + 1);
      writtenAnswered++;
    }

    if (answer.aiEvaluation && answer.aiEvaluation.averageScore != null) {
      const scores = aiScoresByKey.get(key) ?? [];
      scores.push(answer.aiEvaluation.averageScore);
      aiScoresByKey.set(key, scores);
    }
  });

  // 3. Build domain/subskill scores
  const domains: WrittenDomainScore[] = (bank.domains ?? [])
    .filter(domain => {
      // Only include domains that have written subskills
      return (domain.subskills ?? []).some(sub => sub.questionType === 'written');
    })
    .map((domain) => {
      const subskills: WrittenSubskillScore[] = (domain.subskills ?? [])
        .filter(sub => sub.questionType === 'written')
        .map((subskill) => {
          const key = `${domain.domainId}::${subskill.name}`;
          const total = writtenTotals.get(key) ?? 0;
          const answered = answeredByKey.get(key) ?? 0;
          const aiScores = aiScoresByKey.get(key) ?? [];

          // Average AI score across all written answers for this subskill
          const avgAiScore = aiScores.length > 0
            ? aiScores.reduce((sum, s) => sum + s, 0) / aiScores.length
            : 0;

          // Normalise AI score (0-100) to ratio (0-1)
          const ratio = avgAiScore / 100;
          // Keep full precision during calculation; final truncation happens at return
          const score = subskill.priContribution * ratio;

          // "Effective correct" for compatibility with MCQ format
          const effectiveCorrect = total * ratio;

          return {
            name: subskill.name,
            share: subskill.share,
            priContribution: subskill.priContribution,
            answered,
            correct: effectiveCorrect,
            total,
            score,
            aiAverageScore: avgAiScore,
          };
        });

      const domainScore = subskills.reduce((acc, s) => acc + s.score, 0);
      const domainAnswered = subskills.reduce((acc, s) => acc + s.answered, 0);
      const domainCorrect = subskills.reduce((acc, s) => acc + s.correct, 0);
      const domainTotal = subskills.reduce((acc, s) => acc + s.total, 0);

      return {
        domainId: domain.domainId,
        domainName: domain.domainName,
        domainShare: domain.domainShare,
        answered: domainAnswered,
        correct: domainCorrect,
        total: domainTotal,
        score: domainScore,
        subskills,
      };
    });

  const totalScore = domains.reduce((acc, d) => acc + d.score, 0);
  const writtenTotal = Array.from(writtenTotals.values()).reduce((a, v) => a + v, 0);

  // Truncate domain/subskill scores and totals to single decimal before returning
  const truncatedDomains: WrittenDomainScore[] = domains.map((d) => ({
    ...d,
    score: truncateToOneDecimal(d.score),
    correct: truncateToOneDecimal(d.correct),
    subskills: d.subskills.map(s => ({
      ...s,
      score: truncateToOneDecimal(s.score),
      correct: truncateToOneDecimal(s.correct),
      aiAverageScore: truncateToOneDecimal(s.aiAverageScore),
    })),
  }));

  return {
    writtenAnswered,
    writtenTotal,
    totalScore: truncateToOneDecimal(totalScore),
    percentage: truncateToOneDecimal(totalScore),
    domains: truncatedDomains,
  };
}

/**
 * Merges MCQ and Written evaluation results into a single set of domain results.
 * Domains/subskills that appear in both are combined; unique ones are kept as-is.
 */
export function mergeEvaluationResults(
  mcqDomains: Array<{
    domainId: string;
    domainName: string;
    domainShare: number;
    answered: number;
    correct: number;
    total: number;
    score: number;
    subskills: Array<{
      name: string;
      share: number;
      priContribution: number;
      answered: number;
      correct: number;
      total: number;
      score: number;
    }>;
  }>,
  writtenDomains: WrittenDomainScore[],
): typeof mcqDomains {
  const mergedMap = new Map<string, (typeof mcqDomains)[number]>();

  // Start with MCQ domains
  for (const domain of mcqDomains) {
    mergedMap.set(domain.domainId, { ...domain, subskills: [...domain.subskills] });
  }

  // Merge written domains
  for (const wDomain of writtenDomains) {
    const existing = mergedMap.get(wDomain.domainId);
    if (existing) {
      // Add written subskills to existing domain
      for (const wSub of wDomain.subskills) {
        const existingSub = existing.subskills.find(s => s.name === wSub.name);
        if (existingSub) {
          // Combine (unlikely for written + MCQ same subskill, but handle gracefully)
          existingSub.answered += wSub.answered;
          existingSub.correct += wSub.correct;
          existingSub.total += wSub.total;
          existingSub.score = existingSub.score + wSub.score;
        } else {
          existing.subskills.push({
            name: wSub.name,
            share: wSub.share,
            priContribution: wSub.priContribution,
            answered: wSub.answered,
            correct: wSub.correct,
            total: wSub.total,
            score: wSub.score,
          });
        }
      }
      // Recalculate domain totals
      existing.answered += wDomain.answered;
      existing.correct = existing.correct + wDomain.correct;
      existing.total += wDomain.total;
      existing.score = existing.subskills.reduce((acc, s) => acc + s.score, 0);
    } else {
      // New domain from written only
      mergedMap.set(wDomain.domainId, {
        domainId: wDomain.domainId,
        domainName: wDomain.domainName,
        domainShare: wDomain.domainShare,
        answered: wDomain.answered,
        correct: wDomain.correct,
        total: wDomain.total,
        score: wDomain.score,
        subskills: wDomain.subskills.map(s => ({
          name: s.name,
          share: s.share,
          priContribution: s.priContribution,
          answered: s.answered,
          correct: s.correct,
          total: s.total,
          score: s.score,
        })),
      });
    }
  }

  // Ensure merged domain and subskill scores are truncated to single decimal
  return Array.from(mergedMap.values()).map(d => ({
    ...d,
    score: truncateToOneDecimal(d.score),
    correct: truncateToOneDecimal(d.correct),
    subskills: d.subskills.map(s => ({
      ...s,
      score: truncateToOneDecimal(s.score),
      correct: truncateToOneDecimal(s.correct),
    })),
  }));
}
