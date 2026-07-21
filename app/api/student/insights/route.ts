import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import Institution from '@/models/Institution';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import PriTestBank from '@/models/PriTestBank';
import { getStudentFromAuthHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const studentAuth = getStudentFromAuthHeader(req.headers.get('Authorization'));
    if (!studentAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, institutionId } = studentAuth;
    const forceRefresh = req.nextUrl.searchParams.get('force_refresh') === 'true';

    await connectDB();

    const user = await UserAccount.findOne({
      _id: id,
      role: 'student'
    }).populate('institutionId', 'name');

    if (!user) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const institutionName = (user.institutionId as any)?.name || '';

    // 1. Fetch ALL assessments for this student and institution
    const evaluations = await PriTestEvaluation.find({ 
      studentUserId: id, 
      institutionId: institutionId 
    }).lean() as any[];

    // 2. Identify the Absolute Latest Evaluation (Dashboard Source of Truth)
    const sortedEvaluations = [...evaluations].sort(
      (a, b) => new Date(b.evaluatedAt || b.createdAt).getTime() - new Date(a.evaluatedAt || a.createdAt).getTime()
    );
    
    // The "recent PRI test" logic requested by the user: always prioritize the absolute latest attempt 
    // for the dashboard overview, even if it hasn't been officially "published" yet.
    const latestEvaluation = sortedEvaluations[0];

    // Filter evaluations that are officially published for historical average/activity
    const publishedEvaluations: any[] = [];
    const bankIds = [...new Set(evaluations.map(e => e.questionBankId))];
    const banks = await PriTestBank.find({ _id: { $in: bankIds } }).select('institutions').lean();
    const bankMap = new Map();
    banks.forEach(b => bankMap.set(b._id.toString(), b));

    for (const evalDoc of evaluations) {
      if (!evalDoc.questionBankId) continue;
      const bank = bankMap.get(evalDoc.questionBankId.toString());
      if (!bank) continue;
      const instShare = bank.institutions?.find((i: any) => i.institutionId.toString() === institutionId);
      if (instShare?.isResultsPublished) {
        publishedEvaluations.push(evalDoc);
      }
    }

    // Average metrics prefer published results if any exist, otherwise use latest.
    const evaluationsForAverage = publishedEvaluations.length > 0 ? publishedEvaluations : (latestEvaluation ? [latestEvaluation] : []);

    const normalizeInsightsPayload = (payload: unknown): Record<string, unknown> | null => {
      if (!payload || typeof payload !== 'object') return null;
      const obj = payload as Record<string, unknown>;
      if ('overallMetrics' in obj || 'domainMetrics' in obj || 'studentInfo' in obj) return obj;
      if ('summaryInsight' in obj || 'domains' in obj) return { aiInsights: obj };
      return obj;
    };

    // 3. Compute Insights
    let highestScore = 0;
    let totalScore = 0;
    
    evaluationsForAverage.forEach(e => {
      if (e.percentage > highestScore) highestScore = e.percentage;
      totalScore += e.percentage;
    });

    const averageScore = evaluationsForAverage.length > 0 
      ? Math.round(totalScore / evaluationsForAverage.length) 
      : 0;

    const recentActivityList = sortedEvaluations
      .slice(0, 5)
      .map(e => ({
        _id: e.responseId || e._id,
        score: Math.round(e.percentage), // consistently use percentage for score displays
        totalQuestions: e.mcqTotal || 100,
        percentage: Math.round(e.percentage),
        submittedAt: e.evaluatedAt || e.createdAt,
        overallStatus: e.overallStatus,
      }));

    const insightsBaseUrl = process.env.INSIGHTS_SERVICE_URL || process.env.STUDENT_INSIGHTS_SERVICE_URL;
    const normalizedInsightsBaseUrl = insightsBaseUrl?.replace(/\/+$/, '') ?? '';

    let engineInsights: Record<string, any> | null = null;
    let engineError: string | null = null;

    if (latestEvaluation?.aiInsights) {
      engineInsights = normalizeInsightsPayload(latestEvaluation.aiInsights);
    }

    // SYNTHETIC METRICS: Mandatory alignment with Admin API logic (normalization: Score / Share * 100)
    if (!engineInsights && latestEvaluation) {
      const domainMetrics: Record<string, any> = {};
      latestEvaluation.domains?.forEach((d: any) => {
        let normalizedAccuracy = 0;
        if (d.domainShare > 0) {
          normalizedAccuracy = (d.score / d.domainShare) * 100;
        } else if (d.total > 0) {
          normalizedAccuracy = (d.correct / d.total) * 100;
        } else {
          normalizedAccuracy = d.score || 0;
        }

        domainMetrics[d.domainName] = {
          accuracy: Math.round(normalizedAccuracy),
          correct: d.correct,
          questionsAttempted: d.total,
          // Sync banding with standard 4-tier model
          band: normalizedAccuracy >= 90 ? 'EXCEPTIONAL' : (normalizedAccuracy >= 80 ? 'READY' : (normalizedAccuracy >= 60 ? 'ALMOST READY' : 'NEEDS WORK'))
        };
      });

      engineInsights = {
        overallMetrics: {
          percentage: latestEvaluation.percentage,
          band: latestEvaluation.overallStatus === 'fail' ? 'RED' : (latestEvaluation.percentage >= 80 ? 'GREEN' : 'AMBER'),
          accuracy: latestEvaluation.percentage
        },
        domainMetrics
      };
    }

    const response = NextResponse.json({
      user: {
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        studentId: user.studentId,
        institutionName: institutionName
      },
      insights: {
        totalTests: evaluations.length,
        highestScore: Math.round(highestScore),
        averageScore,
      },
      recentActivity: recentActivityList,
      insightsEngine: {
        enabled: true,
        data: engineInsights,
        error: engineError,
      }
    });

    response.headers.set('Cache-Control', 'private, max-age=30');
    return response;

  } catch (error) {
    console.error('Student Personal Insights API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
