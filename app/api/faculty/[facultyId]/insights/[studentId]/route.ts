/**
 * GET /api/faculty/[facultyId]/insights/[studentId]
 * Faculty-facing insight for ONE student.
 * Port of Python: GET /faculty/{faculty_id}/insights/{student_user_id}
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStudentData, saveFacultyInsight } from '@/lib/insights/mongo-extractor';
import { buildFacultyPrompt, buildSubSkillSummary } from '@/lib/insights/faculty-prompt-builder';
import { generateFacultyStudentInsights } from '@/lib/ai/ai-router';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: { facultyId: string; studentId: string } | Promise<{ facultyId: string; studentId: string }> }
) {
  const { facultyId, studentId } = await context.params;
  const forceRefresh = request.nextUrl.searchParams.get('force_refresh') === 'true';

  // Auth: admin or institution admin only
  const authHeader       = request.headers.get('Authorization');
  const admin            = getAdminFromAuthHeader(authHeader);
  const institutionAdmin = !admin ? getInstitutionAdminFromAuthHeader(authHeader) : null;

  if (!admin && !institutionAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const studentData = await getStudentData(studentId);
    if (!studentData) {
      return NextResponse.json(
        { error: `No PRI evaluation found for studentUserId='${studentId}'.` },
        { status: 404 }
      );
    }

    const prompt         = buildFacultyPrompt(studentData);
    const subSkillSummary = buildSubSkillSummary(studentData);
    const aiInsights     = await generateFacultyStudentInsights(facultyId, studentId, prompt, forceRefresh);

    const totalQ       = Object.values(studentData.domains).reduce((s, d) => s + d.questionsAttempted, 0);
    const totalCorrect = Object.values(studentData.domains).reduce((s, d) => s + d.correct, 0);
    const totalTimeSec = Object.values(studentData.domains).reduce((s, d) => s + d.totalTimeSec, 0);
    const totalEstSec  = Object.values(studentData.domains).reduce((s, d) => s + d.estTimeSec, 0);
    const efficiency   = totalEstSec > 0 ? (totalTimeSec / totalEstSec).toFixed(1) : '1.0';
    const accPct       = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 1000) / 10 : 0;

    const payload = {
      facultyId,
      generatedAt: new Date().toISOString(),
      studentInfo: {
        studentUserId: studentId,
        studentId:     studentData.studentId,
        name:          studentData.studentName,
        username:      studentData.studentUsername,
        programme:     studentData.programme,
        institutionId: studentData.batch,
        examDate:      studentData.examDate,
      },
      overallMetrics: {
        score:           totalCorrect,
        maxScore:        totalQ,
        percentage:      accPct,
        band:            studentData.priBand,
        priBand:         studentData.priBand,
        totalQuestions:  totalQ,
        correctAnswers:  totalCorrect,
        accuracy:        accPct,
        timeTaken:       `${Math.floor(totalTimeSec / 60)}m ${totalTimeSec % 60}s`,
        timeEfficiency:  `${efficiency}x avg`,
        needsAttention:  totalQ - totalCorrect,
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

    // Write-back to MongoDB
    await saveFacultyInsight(facultyId, studentId, payload).catch(err =>
      console.error('[faculty/insights] DB write-back failed:', err)
    );

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('[GET /api/faculty/[facultyId]/insights/[studentId]]', error);
    return NextResponse.json({ error: error.message || 'Failed to generate faculty insight' }, { status: 500 });
  }
}
