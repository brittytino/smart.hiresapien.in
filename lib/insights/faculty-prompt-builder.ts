/**
 * Faculty prompt builder — TypeScript port of Python facultyInsights/prompt_builder.py
 * Builds faculty-facing diagnostic prompts (clinical, not student-facing).
 */

import type { StudentData } from './mongo-extractor';

export const DOMAIN_ORDER = [
  'Cognitive Intelligence',
  'Business Intelligence',
  'Problem Solving',
  'Communication',
  'Leadership',
  'Digital Business',
  'Workspace Psychology',
];

function bandFromAccuracy(acc: number): string {
  if (acc >= 75) return 'GREEN';
  if (acc >= 50) return 'AMBER';
  return 'RED';
}

function statusFromAccuracy(acc: number): string {
  if (acc >= 75) return 'On Track';
  if (acc >= 50) return 'Borderline';
  return 'Needs Intervention';
}

function speedLabel(ratio: number): string {
  if (ratio < 0.9) return `Fast (${ratio}x)`;
  if (ratio > 1.1) return `Slow (${ratio}x)`;
  return `Average (${ratio}x)`;
}

// ── Sub-skill summary (computed, not AI-generated) ─────────────────────────
export function buildSubSkillSummary(studentData: StudentData) {
  const summary: {
    domain:        string;
    subSkill:      string;
    accuracy:      number;
    correct:       number;
    total:         number;
    band:          string;
    status:        string;
    avgTimeRatio:  number;
  }[] = [];

  for (const domain of DOMAIN_ORDER) {
    if (!(domain in studentData.domains)) continue;
    const d = studentData.domains[domain];
    for (const ss of d.subSkillDetails) {
      summary.push({
        domain,
        subSkill:     ss.name,
        accuracy:     ss.accuracy,
        correct:      ss.correct,
        total:        ss.total,
        band:         bandFromAccuracy(ss.accuracy),
        status:       statusFromAccuracy(ss.accuracy),
        avgTimeRatio: ss.avgTimeRatio,
      });
    }
  }
  return summary;
}

// ── Faculty AI prompt ──────────────────────────────────────────────────────
export function buildFacultyPrompt(studentData: StudentData): string {
  const name      = studentData.studentName;
  const batch     = studentData.batch;
  const programme = studentData.programme || 'MBA';
  const band      = studentData.priBand;
  const accPct    = Math.round(studentData.overallAccuracy * 100);
  const priScore  = studentData.overallScore;

  const totalQ       = Object.values(studentData.domains).reduce((s, d) => s + d.questionsAttempted, 0);
  const totalCorrect = Object.values(studentData.domains).reduce((s, d) => s + d.correct, 0);
  const totalTime    = Object.values(studentData.domains).reduce((s, d) => s + d.totalTimeSec, 0);
  const estTime      = Object.values(studentData.domains).reduce((s, d) => s + d.estTimeSec, 0);
  const efficiency   = estTime > 0 ? Math.round((totalTime / estTime) * 100) / 100 : 1.0;

  const timeTakenStr = `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`;
  const effStr       = `${efficiency}x avg`;

  const domainLines: string[] = [];
  for (const domain of DOMAIN_ORDER) {
    if (!(domain in studentData.domains)) continue;
    const d      = studentData.domains[domain];
    const dAcc   = Math.round(d.accuracy * 100);
    const dBand  = d.band;
    const speed  = speedLabel(d.avgTimeRatio);
    const subStr = d.subSkillDetails.map(ss => `${ss.name}: ${ss.correct}/${ss.total} (${ss.accuracy}%)`).join(' | ');
    domainLines.push(`  - ${domain} [${dBand}]: ${dAcc}% accuracy | Speed: ${speed} | Sub-skills: [${subStr}]`);
  }

  const presentDomains = DOMAIN_ORDER.filter(d => d in studentData.domains);
  const domainSchemaBlock = presentDomains.map(d => `    "${d}": {
      "domainBand": "GREEN" | "AMBER" | "RED",
      "facultyNote": "<one sentence diagnostic: what pattern does this domain score reveal?>",
      "watchList": ["SubSkillName (XX%) - one-line reason for concern"],
      "commendList": ["SubSkillName (XX%) - one-line reason for commendation"],
      "suggestedIntervention": "<one specific, actionable instructional suggestion for faculty>"
    }`).join(',\n');

  return `You are a faculty advisor at GRAD360 reviewing a student's MBA Placement Readiness Index (PRI) report.
Your role is to provide a diagnostic assessment for faculty use -- clinical, specific, and actionable.
Do NOT write as if you are talking to the student. Write for the faculty member who will use this to guide intervention.

Student Profile:
  Name: ${name}
  Batch: ${batch} | Programme: ${programme}
  PRI Band: ${band}

Overall Performance:
  - Accuracy: ${accPct}% (${totalCorrect} correct / ${totalQ} total questions)
  - Time Taken: ${timeTakenStr} (Efficiency: ${effStr})
  - Overall PRI Score: ${priScore}

Domain-wise Breakdown:
${domainLines.join('\n')}

Generate a faculty-facing diagnostic report for this student.
Return ONLY a valid JSON object (no markdown, no code fences) with EXACTLY this structure:

{
  "interventionPriority": "High" | "Medium" | "Low",
  "facultySummary": [
    "Bullet 1: Overall placement readiness diagnosis in one concise sentence.",
    "Bullet 2: Most critical strength to leverage.",
    "Bullet 3: Most urgent gap requiring faculty attention."
  ],
  "domains": {
${domainSchemaBlock}
  }
}

Rules:
- interventionPriority must be "High" if PRI band is RED, "Medium" if AMBER, "Low" if GREEN.
- facultySummary must be exactly 3 bullet strings -- no sub-bullets, no markdown.
- watchList: include only sub-skills below 60% accuracy. If none, return empty array [].
- commendList: include only sub-skills at or above 75% accuracy. If none, return empty array [].
- Only include domains that appear in the student data above.
- Tone: objective, evidence-based, like a faculty report -- not motivational.
- Keep all text extremely concise to avoid token truncation.
- Do NOT include any text outside the JSON object.
- Strictly validate JSON syntax. No trailing commas.`;
}
