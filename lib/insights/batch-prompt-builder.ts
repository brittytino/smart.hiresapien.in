export const BATCH_DOMAIN_ORDER = [
  'Cognitive Intelligence',
  'Business Intelligence',
  'Problem Solving',
  'Communication',
  'Leadership',
  'Digital Business',
  'Workspace Psychology',
];

export interface BatchStudentRiskInput {
  id: string;
  username: string;
  fullName?: string;
  studentId?: string;
  percentage: number;
  overallStatus?: 'pass' | 'fail' | 'pending';
  evaluatedAt?: string;
  weakDomains: string[];
}

export interface BatchDomainInput {
  domainName: string;
  averageAccuracy: number;
  weakCount: number;
  strongCount: number;
  averageScore: number;
  subskillWeaknesses: Array<{
    name: string;
    averageAccuracy: number;
    weakCount: number;
  }>;
}

export interface BatchPromptInput {
  institutionId: string;
  batchName: string;
  totalStudents: number;
  evaluatedStudents: number;
  averageScore: number;
  passRate: number;
  weakDomains: BatchDomainInput[];
  urgentStudents: BatchStudentRiskInput[];
  topSubskillGaps: Array<{
    domainName: string;
    subSkillName: string;
    averageAccuracy: number;
    weakCount: number;
  }>;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

export function buildBatchPrompt(input: BatchPromptInput): string {
  const weakDomainLines = input.weakDomains.length
    ? input.weakDomains.map((domain) => {
        const subskills = domain.subskillWeaknesses.length
          ? domain.subskillWeaknesses
              .slice(0, 4)
              .map((subskill) => `${subskill.name} (${formatPercent(subskill.averageAccuracy)}; weak in ${subskill.weakCount} students)`)
              .join(' | ')
          : 'No subskill pattern captured';

        return `- ${domain.domainName}: avg ${formatPercent(domain.averageAccuracy)}, weak in ${domain.weakCount} students, strong in ${domain.strongCount} students, subskills: ${subskills}`;
      }).join('\n')
    : '- No clear weak-domain pattern detected yet.';

  const urgentStudentLines = input.urgentStudents.length
    ? input.urgentStudents.slice(0, 8).map((student) => {
        const name = student.fullName || student.username || student.studentId || student.id;
        return `- ${name} (${student.username || 'unknown'}): ${Math.round(student.percentage)}% | weak domains: ${student.weakDomains.join(', ') || 'none'} | status: ${student.overallStatus || 'pending'}`;
      }).join('\n')
    : '- No urgent-risk students identified.';

  const topSubskillLines = input.topSubskillGaps.length
    ? input.topSubskillGaps.slice(0, 8).map((item) => `${item.domainName} / ${item.subSkillName}: ${formatPercent(item.averageAccuracy)} across ${item.weakCount} students`).join('\n')
    : '- No subskill gap data available.';

  return `You are an institution-admin analytics advisor for GRAD360.
Your task is to turn a batch of PRI evaluation data into concise, actionable coaching insights for an MBA institution admin.
Write for a busy administrator. Be direct, specific, and operational.

Context:
- Institution ID: ${input.institutionId}
- Batch: ${input.batchName}
- Total students in batch: ${input.totalStudents}
- Evaluated students: ${input.evaluatedStudents}
- Batch average score: ${formatPercent(input.averageScore)}
- Batch pass rate: ${formatPercent(input.passRate)}

Cohort patterns:
${weakDomainLines}

Top subskill gaps:
${topSubskillLines}

Urgent-risk students:
${urgentStudentLines}

Return ONLY valid JSON with this exact structure:
{
  "summaryInsight": "1-2 sentence executive summary of the batch health",
  "cohortReadiness": "short readiness statement for institution admin",
  "topFindings": ["short finding 1", "short finding 2", "short finding 3"],
  "weakDomains": [
    {
      "domainName": "string",
      "averageAccuracy": 0,
      "riskCount": 0,
      "intervention": "one concrete action for the admin",
      "whyItMatters": "one short reason"
    }
  ],
  "urgentStudents": [
    {
      "studentName": "string",
      "username": "string",
      "riskReason": "short reason",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "recommendedActions": ["action 1", "action 2", "action 3"]
}

Rules:
- Keep it concise and actionable.
- Mention only the highest-impact weak domains and the students needing attention.
- Recommended actions must be operational, not generic.
- If there are no urgent students, return an empty array.
- Do not include markdown, code fences, or extra commentary.`;
}
