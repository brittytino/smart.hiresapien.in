/**
 * GET /api/institution/[institutionId]/insights
 * Batch insight generation for ALL students in an institution.
 * Port of Python: GET /institution/{institution_id}/insights
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getStudentData,
  getInstitutionStudentIds,
  saveFacultyInsight,
} from '@/lib/insights/mongo-extractor';
import { buildFacultyPrompt, buildSubSkillSummary, DOMAIN_ORDER } from '@/lib/insights/faculty-prompt-builder';
import { generateFacultyStudentInsights } from '@/lib/ai/ai-router';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: { institutionId: string } | Promise<{ institutionId: string }> }
) {
  const { institutionId } = await context.params;
  const forceRefresh      = request.nextUrl.searchParams.get('force_refresh') === 'true';

  // Auth: admin or institution admin only
  const authHeader       = request.headers.get('Authorization');
  const admin            = getAdminFromAuthHeader(authHeader);
  const institutionAdmin = !admin ? getInstitutionAdminFromAuthHeader(authHeader) : null;

  if (!admin && !institutionAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const studentIds = await getInstitutionStudentIds(institutionId);
    if (!studentIds.length) {
      return NextResponse.json(
        { error: `No students found for institutionId='${institutionId}'.` },
        { status: 404 }
      );
    }

    const studentsOutput: object[] = [];
    const errors: { studentUserId: string; reason: string }[] = [];

    for (const sid of studentIds) {
      try {
        const studentData = await getStudentData(sid);
        if (!studentData) {
          errors.push({ studentUserId: sid, reason: 'No PRI evaluation record found' });
          continue;
        }

        const prompt          = buildFacultyPrompt(studentData);
        const subSkillSummary = buildSubSkillSummary(studentData);
        const aiInsights      = await generateFacultyStudentInsights(
          institutionId, sid, prompt, forceRefresh
        );

        const totalQ       = Object.values(studentData.domains).reduce((s, d) => s + d.questionsAttempted, 0);
        const totalCorrect = Object.values(studentData.domains).reduce((s, d) => s + d.correct, 0);
        const totalTimeSec = Object.values(studentData.domains).reduce((s, d) => s + d.totalTimeSec, 0);
        const totalEstSec  = Object.values(studentData.domains).reduce((s, d) => s + d.estTimeSec, 0);
        const efficiency   = totalEstSec > 0 ? (totalTimeSec / totalEstSec).toFixed(1) : '1.0';
        const accPct       = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 1000) / 10 : 0;

        const payload = {
          studentInfo: {
            studentUserId: sid,
            studentId:     studentData.studentId,
            name:          studentData.studentName,
            username:      studentData.studentUsername,
            programme:     studentData.programme,
            institutionId: studentData.batch,
            examDate:      studentData.examDate,
          },
          overallMetrics: {
            score:          totalCorrect,
            maxScore:       totalQ,
            percentage:     accPct,
            band:           studentData.priBand,
            priBand:        studentData.priBand,
            totalQuestions: totalQ,
            correctAnswers: totalCorrect,
            accuracy:       accPct,
            timeTaken:      `${Math.floor(totalTimeSec / 60)}m ${totalTimeSec % 60}s`,
            timeEfficiency: `${efficiency}x avg`,
            needsAttention: totalQ - totalCorrect,
          },
          domainMetrics: Object.fromEntries(
            Object.entries(studentData.domains).map(([name, d]) => [name, {
              accuracy:           Math.round(d.accuracy * 1000) / 10,
              band:               d.band,
              questionsAttempted: d.questionsAttempted,
              correct:            d.correct,
              avgTimeRatio:       d.avgTimeRatio,
              totalTimeSec:       d.totalTimeSec,
              subSkills:          d.subSkillDetails,
              strongSubSkills:    d.strongSubSkills,
              weakSubSkills:      d.weakSubSkills,
            }])
          ),
          subSkillSummary,
          aiInsights,
        };

        await saveFacultyInsight(institutionId, sid, payload).catch(() => {});
        studentsOutput.push(payload);
      } catch (err: any) {
        errors.push({ studentUserId: sid, reason: err.message || 'Unknown error' });
      }
    }

    if (!studentsOutput.length && errors.length) {
      return NextResponse.json(
        { error: 'All insight generations failed.', errors },
        { status: 503 }
      );
    }

    // Batch-level domain weak counts
    const batchInsights: Record<string, { weakCount: number; weakPercentage: number }> = {};
    for (const domain of DOMAIN_ORDER) {
      batchInsights[domain] = { weakCount: 0, weakPercentage: 0 };
    }

    for (const student of studentsOutput as any[]) {
      const dm = student.domainMetrics || {};
      for (const [domain, metrics] of Object.entries(dm) as [string, any][]) {
        if (domain in batchInsights && (metrics.band === 'RED' || metrics.accuracy < 50)) {
          batchInsights[domain].weakCount++;
        }
      }
    }

    const totalProcessed = studentsOutput.length;
    if (totalProcessed > 0) {
      for (const domain of Object.keys(batchInsights)) {
        batchInsights[domain].weakPercentage = Math.round(
          (batchInsights[domain].weakCount / totalProcessed) * 1000
        ) / 10;
      }
    }

    return NextResponse.json({
      institutionId,
      totalStudents: studentIds.length,
      processed:     totalProcessed,
      failed:        errors.length,
      generatedAt:   new Date().toISOString(),
      batchInsights,
      students:      studentsOutput,
      errors,
    });
  } catch (error: any) {
    console.error('[GET /api/institution/[institutionId]/insights]', error);
    return NextResponse.json({ error: error.message || 'Failed to generate institution insights' }, { status: 500 });
  }
}
