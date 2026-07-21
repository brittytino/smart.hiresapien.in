/**
 * Student prompt builder — TypeScript port of Python studentInsights/prompt_builder.py
 * Builds rich personalised coaching prompts for the AI to generate per-student insights.
 */

import type { StudentData } from './mongo-extractor';

export const DOMAIN_ORDER = [
  'Cognitive Intelligence',
  'Business Intelligence',
  'Problem Solving',
  'Communication',
  'Leadership',
  'Digital Business',
];

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  'Cognitive Intelligence': 'Tests how you process information, form logical arguments, and think critically under pressure.',
  'Business Intelligence':  'Measures your grasp of data-driven decision-making, market analysis, and business acumen.',
  'Problem Solving':        'Evaluates your ability to break down complex problems, apply frameworks, and reach sound conclusions.',
  'Communication':          'Assesses how clearly and persuasively you express ideas in written and verbal formats.',
  'Leadership':             'Gauges your ability to influence teams, manage conflicts, and drive outcomes in group scenarios.',
  'Digital Business':       'Tests your understanding of digital transformation, tech-enabled strategy, and e-commerce dynamics.',
};

function speedLabel(ratio: number): string {
  if (ratio < 0.9) return `fast (${ratio}x avg)`;
  if (ratio > 1.1) return `slow (${ratio}x avg)`;
  return `on-pace (${ratio}x avg)`;
}

function bandToneContext(band: string, overallAcc: number): string {
  if (band === 'GREEN') {
    return `This student is placement-ready at ${overallAcc}% accuracy. Celebrate their strengths genuinely, then push them toward mastery — they should be aiming for top-quartile performance, not just 'good enough'.`;
  }
  if (band === 'AMBER') {
    return `This student is on the edge at ${overallAcc}% accuracy. Be candid but encouraging — they're close, and the right focus areas can flip them to placement-ready. Prioritise the specific sub-skills dragging their score down.`;
  }
  return `This student is at ${overallAcc}% accuracy and needs urgent, structured support. Be honest and direct without being discouraging. Name the specific gaps clearly. The action plan should feel achievable, not overwhelming — small wins matter here.`;
}

function summariseDomainForPrompt(domainName: string, d: StudentData['domains'][string]): string {
  const dAcc    = Math.round(d.accuracy * 100);
  const speed   = speedLabel(d.avgTimeRatio);
  const correct = d.correct;
  const total   = d.questionsAttempted;

  const lines: string[] = [
    `  [${domainName}]  ${dAcc}% accuracy (${correct}/${total} correct) | Time: ${speed} | Band: ${d.band}`,
  ];

  for (const ss of d.subSkillDetails) {
    const flag = ss.accuracy >= 70 ? '[CORRECT]' : (ss.accuracy < 50 ? '[WRONG]' : '[PARTIAL]');
    lines.push(`    ${flag} ${ss.name}: ${ss.correct}/${ss.total} correct (${ss.accuracy}%) | ${speedLabel(ss.avgTimeRatio)}`);
  }

  // NOTE: Per-question [CORRECT]/[WRONG] lists removed — they added ~3,000 tokens
  // (one line per question × 127 questions) but were redundant with the sub-skill
  // accuracy stats above. Claude doesn't need individual question data to generate
  // actionable coaching insights.

  return lines.join('\n');
}

export function buildStudentPrompt(studentData: StudentData): string {
  const { studentName, batch, priBand, overallAccuracy, overallScore, domains } = studentData;
  const programme   = studentData.programme || 'MBA';
  const overallAcc  = Math.round(overallAccuracy * 100);
  const totalQ      = Object.values(domains).reduce((s, d) => s + d.questionsAttempted, 0);
  const totalCorrect = Object.values(domains).reduce((s, d) => s + d.correct, 0);
  const totalTime   = Object.values(domains).reduce((s, d) => s + d.totalTimeSec, 0);
  const estTime     = Object.values(domains).reduce((s, d) => s + d.estTimeSec, 0);
  const efficiency  = estTime > 0 ? Math.round((totalTime / estTime) * 100) / 100 : 1.0;

  const timeTaken    = `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`;
  const timeEfficiency = `${efficiency}x avg`;

  const presentDomains = DOMAIN_ORDER.filter(d => d in domains);

  const bestDomain  = presentDomains.length ? presentDomains.reduce((a, b) => domains[a].accuracy > domains[b].accuracy ? a : b) : null;
  const worstDomain = presentDomains.length ? presentDomains.reduce((a, b) => domains[a].accuracy < domains[b].accuracy ? a : b) : null;

  const domainBlock = presentDomains.map(d => summariseDomainForPrompt(d, domains[d])).join('\n\n');
  const toneContext = bandToneContext(priBand, overallAcc);

  const bestNote  = bestDomain  ? `strongest in ${bestDomain} (${Math.round(domains[bestDomain].accuracy * 100)}%)`  : '';
  const worstNote = worstDomain ? `biggest gap in ${worstDomain} (${Math.round(domains[worstDomain].accuracy * 100)}%)` : '';

  const domainSchemaBlock = presentDomains.map(d => `    "${d}": {
      "description": "${DOMAIN_DESCRIPTIONS[d] || ''}",
      "insights": "<2-3 sentences analysing ${studentName}'s actual performance in this domain>",
      "strengths": ["SubSkillName: X/Y correct (Z%). <coach-voice sentence>. Strong concepts: <concepts>"],
      "improvements": ["SubSkillName: X/Y correct (Z%). <direct sentence on gap>. Wrong concepts: <concepts>"],
      "actionPlan": {
        "high":   { "title": "<weakest sub-skill name and accuracy%>",  "steps": ["<step 1>", "<step 2>"] },
        "medium": { "title": "<second weakest sub-skill name and accuracy%>", "steps": ["<step 1>", "<step 2>"] },
        "low":    { "title": "<strongest sub-skill name and accuracy%>", "steps": ["<step 1>", "<step 2>"] }
      }
    }`).join(',\n');

  return `You are GRAD360's AI placement coach. Your job is to write personalised, human-sounding MBA coaching insights for a real student — NOT a template, NOT a report card. Write like a sharp, empathetic coach who has studied this student's data and genuinely wants to help them improve.

━━━ STUDENT DATA ━━━
Name: ${studentName}
Batch: ${batch} | Programme: ${programme}
PRI Band: ${priBand}

Overall Performance:
  Score: ${overallScore} | Accuracy: ${overallAcc}% (${totalCorrect}/${totalQ} correct)
  Time taken: ${timeTaken} | Time efficiency: ${timeEfficiency}

Domain + Sub-skill Breakdown:
  Legend: [CORRECT] = strong (>=70%) | [PARTIAL] = developing (50-69%) | [WRONG] = needs work (<50%)

${domainBlock}


--- COACH BRIEFING ---
${toneContext}
They are ${bestNote} and have their ${worstNote}.

━━━ YOUR TASK ━━━
Generate a personalised insight report. Every sentence must feel like it was written specifically for ${studentName} — not copy-pasted for any MBA student.

Return ONLY a valid JSON object (no markdown, no code fences) with EXACTLY this structure:

{
  "summaryInsight": "Exactly 3 bullet points separated by newlines, each starting with '• '. Each bullet must: (1) name a specific insight from ${studentName}'s actual data, (2) NOT mention PRI band labels or batch comparisons, (3) read like something a coach would say. Cover: overall performance + standout strength + the one gap that matters most.",
  "domains": {
${domainSchemaBlock}
  }
}

━━━ RULES ━━━
1. PERSONALISATION: Every field must directly reference ${studentName}'s actual numbers and sub-skill data.
2. TONE: Conversational, direct, and warm — like WhatsApp notes from a great coach, not a corporate HR report.
3. SCORE FORMAT: Use actual numbers: e.g. "7/9 correct (78%)" — do NOT round or generalise.
4. STRENGTHS vs IMPROVEMENTS: Sub-skills >=70% go into strengths, <70% go into improvements.
5. ACTION PLAN: 'high' priority = weakest sub-skill, 'medium' = developing one, 'low' = strength to maintain.
6. CONCEPTS: For "Strong concepts" and "Wrong concepts", list specific MBA/placement exam concept names.
7. JSON RULES: Return ONLY the JSON. No text before or after.
8. ONLY include domains that appear in the student's domain breakdown above.`;
}
