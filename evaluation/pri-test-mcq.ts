import type { IQuestionBank } from '@/models/QuestionBank';
import type { IPriTestResponse } from '@/models/PriTestResponse';

export interface McqSubskillScore {
  name: string;
  share: number;
  priContribution: number;
  answered: number;
  correct: number;
  total: number;
  score: number;
}

export interface McqDomainScore {
  domainId: string;
  domainName: string;
  domainShare: number;
  answered: number;
  correct: number;
  total: number;
  score: number;
  subskills: McqSubskillScore[];
}

export interface McqEvaluationResult {
  mcqCorrect: number;
  mcqTotal: number;
  totalScore: number;
  percentage: number;
  domains: McqDomainScore[];
}

// Truncate to single decimal place without rounding
function truncateToOneDecimal(value: number) {
  return Math.trunc(value * 10) / 10;
}

export function evaluateMcqResponse(bank: IQuestionBank, response: IPriTestResponse): McqEvaluationResult {
  const questionIndexMap = new Map<number, typeof bank.questions[number]>();
  (bank.questions ?? []).forEach((question, index) => {
    questionIndexMap.set(index, question);
  });

  const mcqTotals = new Map<string, number>();
  (bank.questions ?? []).forEach((question, index) => {
    if (question.questionType !== 'mcq') return;
    // Exclude workspace-psychology from MCQ evaluation
    if (question.domainId === 'workspace-psychology') return;
    const key = `${question.domainId}::${question.subSkill ?? ''}`;
    mcqTotals.set(key, (mcqTotals.get(key) ?? 0) + 1);
    questionIndexMap.set(index, question);
  });

  const mcqCorrectByKey = new Map<string, number>();
  const mcqAnsweredByKey = new Map<string, number>();
  let mcqCorrect = 0;
  (response.answers ?? []).forEach((answer) => {
    if (answer.questionType !== 'mcq') return;
    if (answer.domainId === 'workspace-psychology') return; // handled by psychometric engine
    const question = questionIndexMap.get(answer.questionIndex);
    if (!question) return;
    // Exclude workspace-psychology from MCQ evaluation
    if (question.domainId === 'workspace-psychology') return;
    const subSkill = question.subSkill ?? '';
    const key = `${question.domainId}::${subSkill}`;
    const correctAnswer = answer.correctAnswer ?? question.correctAnswer ?? '';
    const selected = answer.selectedOption ?? '';
    const isCorrect = typeof answer.isCorrect === 'boolean'
      ? answer.isCorrect
      : Boolean(correctAnswer && selected && selected === correctAnswer);

    if (selected) {
      mcqAnsweredByKey.set(key, (mcqAnsweredByKey.get(key) ?? 0) + 1);
    }
    if (isCorrect) {
      mcqCorrect += 1;
      mcqCorrectByKey.set(key, (mcqCorrectByKey.get(key) ?? 0) + 1);
    }
  });

  // Filter out workspace-psychology from domain results
  const domains: McqDomainScore[] = (bank.domains ?? [])
    .filter(domain => domain.domainId !== 'workspace-psychology')
    .map((domain) => {
    const subskills: McqSubskillScore[] = (domain.subskills ?? []).map((subskill) => {
      const key = `${domain.domainId}::${subskill.name}`;
      const total = mcqTotals.get(key) ?? 0;
      const answered = mcqAnsweredByKey.get(key) ?? 0;
      const correct = mcqCorrectByKey.get(key) ?? 0;
      const ratio = total > 0 ? correct / total : 0;
      // Keep full precision during calculation; final truncation happens at return
      const score = subskill.priContribution * ratio;

      return {
        name: subskill.name,
        share: subskill.share,
        priContribution: subskill.priContribution,
        answered,
        correct,
        total,
        score,
      };
    });

    const domainScore = subskills.reduce((acc, item) => acc + item.score, 0);
    const domainAnswered = subskills.reduce((acc, item) => acc + item.answered, 0);
    const domainCorrect = subskills.reduce((acc, item) => acc + item.correct, 0);
    const domainTotal = subskills.reduce((acc, item) => acc + item.total, 0);

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

  const totalScore = domains.reduce((acc, domain) => acc + domain.score, 0);
  const mcqTotal = Array.from(mcqTotals.values()).reduce((acc, value) => acc + value, 0);
  const percentage = totalScore;

  // Truncate domain/subskill scores and totals to single decimal before returning
  const truncatedDomains: McqDomainScore[] = domains.map((d) => ({
    ...d,
    score: truncateToOneDecimal(d.score),
    subskills: d.subskills.map(s => ({ ...s, score: truncateToOneDecimal(s.score) })),
  }));

  return {
    mcqCorrect,
    mcqTotal,
    totalScore: truncateToOneDecimal(totalScore),
    percentage: truncateToOneDecimal(percentage),
    domains: truncatedDomains,
  };
}
