import { DOMAINS, NO_CORRECT_ANSWER_TYPES } from '@/lib/domains';
import { IQuestionBankDomain, IQuestionBankQuestion } from '@/models/QuestionBank';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';

const MCQ_TEMPLATES = [
  'Which statement best describes {subSkill} in {domain}?',
  'In a {program} context, what is the best example of {subSkill}?',
  'What is the most effective approach to {subSkill} for {domain}?',
  'Which option reflects strong {subSkill} in {domain}?',
];

const WRITTEN_TEMPLATES = [
  'Describe how you would apply {subSkill} in a {program} scenario for {domain}.',
  'Explain a situation where {subSkill} would improve outcomes in {domain}.',
  'Write a short response showing your approach to {subSkill} in {domain}.',
];

const GENERIC_OPTIONS = [
  'Apply a structured approach aligned to the goal.',
  'Focus only on speed and skip validation.',
  'Ignore context and use a generic answer.',
  'Escalate the issue without analyzing the data.',
];

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'] as const;



function pickTemplate(templates: string[], index: number): string {
  return templates[index % templates.length];
}

function fillTemplate(template: string, domain: string, subSkill: string, program: string): string {
  return template
    .replace('{domain}', domain)
    .replace('{subSkill}', subSkill)
    .replace('{program}', program);
}

export function generateQuestionBankQuestions(input: {
  program: string;
  domains: IQuestionBankDomain[];
}): IQuestionBankQuestion[] {
  const questions: IQuestionBankQuestion[] = [];

  input.domains.forEach((domain) => {
    const domainMeta = DOMAINS.find((d) => d.id === domain.domainId);
    const domainName = domain.domainName || domainMeta?.name || domain.domainId;
    // Ipsative domains (e.g. Workspace Psychology) have no correct answer.
    const isIpsative = domainMeta ? NO_CORRECT_ANSWER_TYPES.has(domainMeta.assessmentType) : false;

    domain.subskills.forEach((subskill, subIndex) => {
      const difficultyCounts = subskill.difficultyShare;
      let questionIndex = 0;

      DIFFICULTY_ORDER.forEach((difficulty) => {
        for (let i = 0; i < difficultyCounts[difficulty]; i += 1) {
          const isMcq = subskill.questionType === 'mcq';
          const template = pickTemplate(isMcq ? MCQ_TEMPLATES : WRITTEN_TEMPLATES, questionIndex + subIndex);
          const questionText = fillTemplate(template, domainName, subskill.name, input.program);

          questions.push({
            domainId: domain.domainId,
            domainName,
            subSkill: subskill.name,
            questionType: subskill.questionType,
            difficulty,
            questionText,
            options: isMcq
              ? [
                  { label: 'A', text: GENERIC_OPTIONS[0] },
                  { label: 'B', text: GENERIC_OPTIONS[1] },
                  { label: 'C', text: GENERIC_OPTIONS[2] },
                  { label: 'D', text: GENERIC_OPTIONS[3] },
                ]
              : [],
            // Ipsative domains have no correct answer — do not set one.
            correctAnswer: isMcq && !isIpsative ? 'A' : undefined,
          });

          questionIndex += 1;
        }
      });
    });
  });

  return questions;
}

export async function fetchQuestionBankQuestionsFromDB(input: {
  program: string;
  domains: IQuestionBankDomain[];
}): Promise<IQuestionBankQuestion[]> {
  await connectDB();
  const questions: IQuestionBankQuestion[] = [];

  for (const domain of input.domains) {
    const domainName = domain.domainName || DOMAINS.find((d) => d.id === domain.domainId)?.name || domain.domainId;

    for (const subskill of domain.subskills) {
      const isMcq = subskill.questionType === 'mcq';
      const difficultyCounts = subskill.difficultyShare;

      const domainMeta = DOMAINS.find((d) => d.id === domain.domainId);
      const matchingSubSkills = domainMeta?.skills.filter(
        (s) => s.split(' - ')[0].trim() === subskill.name.trim()
      ) || [subskill.name];

      for (const difficulty of DIFFICULTY_ORDER) {
        const count = difficultyCounts[difficulty];
        if (count <= 0) continue;

        // Fetch random approved questions matching criteria — try exact subSkill match first
        let fetched = await Question.aggregate([
          {
            $match: {
              status: 'approved',
              domain: domain.domainId,
              subSkill: { $in: matchingSubSkills },
              questionType: subskill.questionType,
              difficulty: difficulty,
            },
          },
          { $sample: { size: count } },
        ]);

        // Fallback: if no questions matched by subSkill, query the full domain without subSkill filter.
        // This handles cases where Question.subSkill values don't exactly match the bank's subskill names.
        if (fetched.length === 0) {
          fetched = await Question.aggregate([
            {
              $match: {
                status: 'approved',
                domain: domain.domainId,
                questionType: subskill.questionType,
                difficulty: difficulty,
              },
            },
            { $sample: { size: count } },
          ]);
        }

        // Second fallback: relax difficulty constraint so at least some questions are returned.
        if (fetched.length === 0) {
          fetched = await Question.aggregate([
            {
              $match: {
                status: 'approved',
                domain: domain.domainId,
                questionType: subskill.questionType,
              },
            },
            { $sample: { size: count } },
          ]);
        }

        fetched.forEach((q) => {
          questions.push({
            domainId: domain.domainId,
            domainName,
            subSkill: subskill.name,
            questionType: subskill.questionType,
            difficulty,
            questionText: q.questionText,
            questionImageUrl: q.questionImageUrl,
            caseContext: q.caseContext,
            caseContextImageUrl: q.caseContextImageUrl,
            options: isMcq && q.options
              ? q.options.map((opt: any) => ({
                  label: opt.label,
                  text: opt.text,
                  imageUrl: opt.imageUrl,
                  score: opt.score,
                }))
              : [],
            correctAnswer: isMcq ? q.correctAnswer : undefined,
          });
        });
      }
    }
  }

  return questions;
}
