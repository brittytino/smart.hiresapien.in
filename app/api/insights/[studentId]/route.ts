import { NextRequest, NextResponse } from 'next/server';
import { getStudentData } from '@/lib/insights/mongo-extractor';
import { buildStudentPrompt } from '@/lib/insights/student-prompt-builder';
import { generateStudentInsights, clearStudentCache } from '@/lib/ai/ai-router';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader, getUserFromAuthHeader } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: { studentId: string } | Promise<{ studentId: string }> }
) {
  const { studentId } = await context.params;
  const forceRefresh  = request.nextUrl.searchParams.get('force_refresh') === 'true';

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader        = request.headers.get('Authorization');
  const admin             = getAdminFromAuthHeader(authHeader);
  const institutionAdmin  = !admin ? getInstitutionAdminFromAuthHeader(authHeader) : null;
  const user              = (!admin && !institutionAdmin) ? getUserFromAuthHeader(authHeader) : null;

  if (!admin && !institutionAdmin && user && (user as any).role === 'student') {
    const uid = String((user as any).id || (user as any)._id || '');
    if (uid !== studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // ── Clear cache if requested ──────────────────────────────────────────────
  if (forceRefresh) {
    clearStudentCache(studentId);
  }

  try {
    // ── Fetch MongoDB data ────────────────────────────────────────────────────
    const studentData = await getStudentData(studentId);
    if (!studentData) {
      return NextResponse.json(
        { error: `No PRI evaluation found for studentUserId='${studentId}'.` },
        { status: 404 }
      );
    }

    // ── Build metrics summary ─────────────────────────────────────────────────
    const totalQ       = Object.values(studentData.domains).reduce((s, d) => s + d.questionsAttempted, 0);
    const totalCorrect = Object.values(studentData.domains).reduce((s, d) => s + d.correct, 0);
    const totalTimeSec = Object.values(studentData.domains).reduce((s, d) => s + d.totalTimeSec, 0);
    const totalEstSec  = Object.values(studentData.domains).reduce((s, d) => s + d.estTimeSec, 0);
    const overallPct   = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 1000) / 10 : 0;
    const efficiency   = totalEstSec > 0 ? (totalTimeSec / totalEstSec).toFixed(1) : '1.0';

    function getBandLabel(pct: number): string {
      if (pct >= 75) return 'EXCEPTIONAL';
      if (pct >= 60) return 'STRONG';
      if (pct >= 50) return 'AVERAGE';
      return 'NEEDS WORK';
    }

    // ── Build prompt + call AI (Claude→Gemini with cache) ─────────────────────
    const prompt    = buildStudentPrompt(studentData);
    const aiInsights = await generateStudentInsights(studentId, prompt, forceRefresh).catch(err => {
      console.error('[insights] AI call failed:', err);
      return { summaryInsight: '', domains: {} } as Record<string, unknown>;
    });

    // ── Build domain metrics response ─────────────────────────────────────────
    const domainMetrics: Record<string, unknown> = {};
    for (const [name, d] of Object.entries(studentData.domains)) {
      domainMetrics[name] = {
        accuracy:            Math.round(d.accuracy * 1000) / 10,
        band:                d.band,
        questionsAttempted:  d.questionsAttempted,
        correct:             d.correct,
        avgTimeRatio:        d.avgTimeRatio,
        totalTimeSec:        d.totalTimeSec,
        subSkills:           d.subSkillDetails,
        strongSubSkills:     d.strongSubSkills,
        weakSubSkills:       d.weakSubSkills,
      };
    }

    return NextResponse.json({
      studentInfo: {
        studentUserId: studentId,
        studentId:     studentData.studentId,
        name:          studentData.studentName,
        username:      studentData.studentUsername,
        programme:     studentData.programme,
        batch:         studentData.batch,
        examDate:      studentData.examDate,
      },
      overallMetrics: {
        score:           totalCorrect,
        maxScore:        totalQ,
        percentage:      overallPct,
        band:            getBandLabel(overallPct),
        priBand:         studentData.priBand,
        totalQuestions:  totalQ,
        correctAnswers:  totalCorrect,
        accuracy:        overallPct,
        timeTaken:       `${Math.floor(totalTimeSec / 60)}m ${totalTimeSec % 60}s`,
        timeEfficiency:  `${efficiency}x avg`,
        needsAttention:  totalQ - totalCorrect,
        estTotalTime:    `${Math.floor(totalEstSec / 60)}m`,
      },
      domainMetrics,
      aiInsights,
    });
  } catch (error) {
    console.error('[GET /api/insights/[studentId]]', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
