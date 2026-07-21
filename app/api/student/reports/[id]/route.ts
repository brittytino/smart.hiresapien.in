import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import UserAccount from '@/models/UserAccount';
import Institution from '@/models/Institution';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import { getUserFromAuthHeader } from '@/lib/auth';
import '@/models/QuestionBank'; // For refs if needed

function normalizeInsightsPayload(payload: unknown): Record<string, any> | null {
  if (!payload || typeof payload !== 'object') return null;
  const obj = payload as Record<string, any>;

  // Already full engine response or wrapped shape.
  if ('overallMetrics' in obj || 'domainMetrics' in obj || 'studentInfo' in obj || 'aiInsights' in obj) {
    return obj;
  }

  // Legacy shape with only aiInsights-like fields.
  if ('summaryInsight' in obj || 'domains' in obj) {
    return { aiInsights: obj };
  }

  return obj;
}

// Truncate to single decimal place without rounding
function truncateToOneDecimal(value: number) {
  return Math.trunc(value * 10) / 10;
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id: responseId } = await context.params;
  const authHeader = request.headers.get('Authorization') || '';

  try {
    await connectDB();

    // 1. Fetch Evaluation and Response
    const evaluation = await PriTestEvaluation.findOne({ responseId }).lean() as any;
    const response = await PriTestResponse.findById(responseId).lean() as any;

    if (!evaluation || !response) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // 2. Role-based access control
    const user = getUserFromAuthHeader(authHeader);
    const isAdmin = user && (user.role === 'admin' || user.role === 'institution_admin');
    const isStudent = user && user.role === 'student';
    const isFaculty = user && user.role === 'faculty';

    if (isStudent) {
      const mongoose = require('mongoose');
      const PriTestBank = mongoose.models.PriTestBank || require('@/models/PriTestBank').default;
      const bank = await PriTestBank.findById(response.questionBankId).lean() as any;
      const instShare = bank?.institutions?.find(
        (i: any) => String(i.institutionId) === String(user.institutionId)
      );
      if (!instShare?.isResultsPublished) {
        return NextResponse.json(
          { error: 'Results are not published yet.' },
          { status: 403 }
        );
      }
    }

    // Faculty can only access reports for their own institution
    if (isFaculty && user?.institutionId && String(response.institutionId) !== user.institutionId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Fetch Student and Institution info
    const student = await UserAccount.findById(response.studentUserId).lean() as any;
    const institution = await Institution.findById(response.institutionId).lean() as any;

    // 4. Helper for Visual Banding
    const getBand = (pct: number) => {
      if (pct >= 90) return { label: 'EXCEPTIONAL', color: 'bg-blue-600', fill: '#2563eb', border: 'border-blue-600', text: 'text-blue-700', bgTint: 'bg-blue-50/50' };
      if (pct >= 80) return { label: 'READY', color: 'bg-emerald-500', fill: '#10b981', border: 'border-emerald-500', text: 'text-emerald-700', bgTint: 'bg-emerald-50/50' };
      if (pct >= 60) return { label: 'ALMOST READY', color: 'bg-amber-400', fill: '#fbbf24', border: 'border-amber-400', text: 'text-amber-700', bgTint: 'bg-amber-50/50' };
      return { label: 'DEVELOPING', color: 'bg-red-500', fill: '#ef4444', border: 'border-red-500', text: 'text-red-700', bgTint: 'bg-red-50/50' };
    };

    const mcqPriScoreRaw = Number(evaluation.mcqPriScore ?? 0);
    const writtenPriScoreRaw = Number(evaluation.writtenPriScore ?? 0);
    const storedPercentageRaw = Number(evaluation.percentage ?? 0);
    const fallbackPercentageRaw = Math.min(100, Math.max(0, mcqPriScoreRaw + writtenPriScoreRaw));
    const effectivePriPercentage = storedPercentageRaw > 0 ? storedPercentageRaw : fallbackPercentageRaw;
    const ensuredPriPercentage =
      effectivePriPercentage === 0 && mcqPriScoreRaw > 0 ? 0.01 : effectivePriPercentage;

    const overallBand = getBand(ensuredPriPercentage);

    // 5. Map Domains (now includes both MCQ and written task domains)
    const mappedDomains = (evaluation.domains || []).map((dom: any) => {
      let pct = 0;
      if (dom.domainShare > 0 && dom.score !== undefined) {
        pct = (dom.score / dom.domainShare) * 100;
      } else if (dom.total > 0) {
        pct = (dom.correct / dom.total) * 100;
      }
      const visual = getBand(pct);

      let domTimeStr = 'N/A';
      let domRatioNum = 1.0;
      if (response.domainTimings) {
         const dt = response.domainTimings.find((d: any) => d.domainId === dom.domainId || d.domainName === dom.domainName);
         if (dt && dt.timeSpentSeconds) {
            const m = Math.floor(dt.timeSpentSeconds / 60);
            const s = dt.timeSpentSeconds % 60;
            domTimeStr = `${m}m ${s}s`;
                if (dt.scheduledDurationSeconds && dt.scheduledDurationSeconds > 0) {
                  domRatioNum = truncateToOneDecimal(dt.timeSpentSeconds / dt.scheduledDurationSeconds);
                }
         }
      }

      const mappedSubskills = (dom.subskills || []).map((sk: any) => {
        let accuracyVal = 0;
        if (sk.priContribution > 0 && sk.score !== undefined) {
           accuracyVal = (sk.score / sk.priContribution) * 100;
        } else if (sk.total > 0) {
           accuracyVal = (sk.correct / sk.total) * 100;
        }

        let attemptRate = 0;
        if (sk.total > 0) {
          attemptRate = (sk.attempted / sk.total) * 100;
        }

        let subSkillRatio = 1.0;
        const dt = response.domainTimings?.find((d: any) => d.domainId === dom.domainId || d.domainName === dom.domainName);
        if (dt && dt.scheduledDurationSeconds && dom.total > 0) {
          const benchmarkPerQuestion = dt.scheduledDurationSeconds / dom.total;
          
          const normalizeStr = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const skNameNormalized = normalizeStr(sk.name);
          
          let actualTimeSpent = (response.answers || [])
            .filter((ans: any) => {
               const isDomainMatch = (ans.domainId === dom.domainId || ans.domainId === dom.domainName);
               const isSubSkillMatch = normalizeStr(ans.subSkill) === skNameNormalized;
               return isDomainMatch && isSubSkillMatch;
            })
            .reduce((acc: number, ans: any) => acc + (ans.timeTakenSeconds || 0), 0);
          
          // RECOVERY LOGIC: If question-level time is missing (0), fallback to proportional domain time
          if (actualTimeSpent === 0 && dt.timeSpentSeconds > 0) {
            actualTimeSpent = dt.timeSpentSeconds * (sk.total / dom.total);
          }

          if (actualTimeSpent > 0) {
            subSkillRatio = truncateToOneDecimal(benchmarkPerQuestion * sk.total / actualTimeSpent);
          }
        }

        return {
          skill: sk.name,
          accuracy: accuracyVal,
          attemptRate: truncateToOneDecimal(attemptRate),
          timeEfficiency: subSkillRatio,
          time: domTimeStr,
          status: getBand(accuracyVal).label,
          priContribution: sk.priContribution || 0,
          priScore: sk.score || 0,
        };
      });

      return {
        name: dom.domainName,
        shortName: dom.domainName.split(' ')[0],
        score: dom.correct,
        max: dom.total,
        percentage: truncateToOneDecimal(pct),
        correct: dom.correct,
        total: dom.total,
        time: domTimeStr,
        ratio: domRatioNum,
        ...visual,
        date: evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleDateString() : 'N/A',
        description: '',
        insights: '',
        strengths: [],
        improvements: [],
        actionPlan: {
          high: { title: '', steps: [] },
          medium: { title: '', steps: [] },
          low: { title: '', steps: [] }
        },
        subSkills: mappedSubskills.map((sk: any) => ({ ...sk, accuracy: truncateToOneDecimal(sk.accuracy) }))
      };
    });

    // 6. Map Psychometric
    const psychometric: Array<{ trait: string; status: string }> = [];
    if (evaluation.traitResults) {
      const traitEntries: Array<[string, any]> = evaluation.traitResults instanceof Map
        ? Array.from((evaluation.traitResults as Map<string, any>).entries())
        : Object.entries(evaluation.traitResults as Record<string, any>);

      for (const [trait, result] of traitEntries) {
        const r = result as { passed?: boolean };
        psychometric.push({
          trait: trait.replaceAll('_', ' ').toUpperCase(),
          status: r.passed ? 'PASS' : 'FAIL'
        });
      }
    }

    // 7. Calculate Timing and Percentile Metrics
    let timeTakenStr = 'N/A';
    let estTotalTimeStr = 'N/A';
    let timeEfficiencyStr = '1.0x';
    let timeEfficiencyLabel = 'Optimal time management';
    let percentileRankStr = '---';

    // Summing active seconds spent on each answer
    const totalActiveSeconds = (response.answers || []).reduce((acc: number, ans: any) => acc + (Number(ans.timeTakenSeconds) || 0), 0);
    const finalDurationSeconds = totalActiveSeconds > 0 ? totalActiveSeconds : (response.testDurationSeconds || 0);

    // Requirement: Average time per question based on all domain timings (including psychometric)
    const summedDomainTimeSeconds = (response.domainTimings || []).reduce((acc: number, dt: any) => acc + (dt.timeSpentSeconds || 0), 0);
    const totalQCount = (evaluation.mcqTotal || 0) + (evaluation.writtenTotal || 0);

    if (summedDomainTimeSeconds > 0 && totalQCount > 0) {
       const avg = summedDomainTimeSeconds / totalQCount;
       timeTakenStr = `${avg.toFixed(1)}s / Q`;
    } else if (finalDurationSeconds > 0 && totalQCount > 0) {
       const avg = finalDurationSeconds / totalQCount;
       timeTakenStr = `${avg.toFixed(1)}s / Q`;
    }

    if (response.domainTimings && response.domainTimings.length > 0) {
        const totalScheduled = response.domainTimings.reduce((acc: number, dt: any) => acc + (dt.scheduledDurationSeconds || 0), 0);
        if (totalScheduled > 0) {
            const sm = Math.floor(totalScheduled / 60);
            estTotalTimeStr = `${sm}m`;
            
            // Logic: Compare scheduled duration to active time (or wall-clock time if active time is 0)
            const diffSecs = summedDomainTimeSeconds > 0 ? summedDomainTimeSeconds : (totalActiveSeconds > 0 ? totalActiveSeconds : (response.testDurationSeconds || (
               response.startedAt && response.submittedAt 
                 ? Math.floor((new Date(response.submittedAt).getTime() - new Date(response.startedAt).getTime()) / 1000)
                 : 0
            )));

            if (diffSecs > 0) {
                // Correct efficiency logic: scheduled / actual = multiplier (e.g. 1.2x faster)
                const ratio = totalScheduled / diffSecs;
                timeEfficiencyStr = ratio.toFixed(1) + 'x';
                
                if (ratio > 1.1) {
                  timeEfficiencyLabel = 'Highly efficient pacing';
                } else if (ratio < 0.9) {
                  timeEfficiencyLabel = 'Needs pacing optimization';
                } else {
                  timeEfficiencyLabel = 'Optimal time management';
                }
            }
        }
    }

    // --- Percentile Calculation ---
    try {
      const totalStudentsCount = await PriTestEvaluation.countDocuments({ 
        questionBankId: response.questionBankId,
        status: 'completed'
      });
      if (totalStudentsCount > 0) {
        // Find how many students scored strictly less than current student
        const lowerScores = await PriTestEvaluation.countDocuments({
          questionBankId: response.questionBankId,
          status: 'completed',
          percentage: { $lt: ensuredPriPercentage }
        });
        // Percentile = (Rank / Total) * 100
        // If there's only 1 student, it's 100th percentile.
        const pRank = totalStudentsCount > 1 
          ? ((lowerScores / (totalStudentsCount - 1)) * 100)
          : 100;
        
        percentileRankStr = `${pRank.toFixed(1)}th`;
      }
    } catch (err) {
      console.warn('[report] Percentile calculation failed:', err);
    }

    // 8. Calculate True Totals from Domains
    const totalQuestionsFromDomains = mappedDomains.length > 0 
      ? mappedDomains.reduce((acc: number, d: any) => acc + (d.total || 0), 0)
      : evaluation.mcqTotal;
      
    const totalCorrectFromDomainsRaw = mappedDomains.reduce((acc: number, d: any) => acc + (d.correct || 0), 0);
    const totalCorrectFromDomains = mappedDomains.length > 0 
      ? truncateToOneDecimal(totalCorrectFromDomainsRaw)
      : evaluation.mcqCorrect;

    const totalAttemptedFromDomains = mappedDomains.reduce((acc: number, d: any) => acc + (d.attempted || 0), 0);

    const rawAccuracy = totalQuestionsFromDomains > 0 
      ? (totalCorrectFromDomainsRaw / totalQuestionsFromDomains) * 100 
      : 0;

    const overallAttemptRate = totalQuestionsFromDomains > 0 
      ? (totalAttemptedFromDomains / totalQuestionsFromDomains) * 100 
      : 0;
    
    const overallPrecision = totalAttemptedFromDomains > 0 
      ? (totalCorrectFromDomainsRaw / totalAttemptedFromDomains) * 100 
      : 100;

    let strategyLabel = 'BALANCED';
    let strategyDesc = 'Steady performance & consistent pace';
    
    if (overallAttemptRate >= 90 && overallPrecision >= 85) {
      strategyLabel = 'OPTIMAL';
      strategyDesc = 'Exceptional speed and high accuracy';
    } else if (overallAttemptRate < 75 && overallPrecision >= 85) {
      strategyLabel = 'PRECISION FOCUSED';
      strategyDesc = 'High quality results, but needs more speed';
    } else if (overallAttemptRate >= 90 && overallPrecision < 70) {
      strategyLabel = 'AGGRESSIVE';
      strategyDesc = 'High attempt volume with low selective quality';
    } else if (overallAttemptRate < 60) {
      strategyLabel = 'CAUTIOUS';
      strategyDesc = 'Very selective, needs significantly more attempts';
    }

    const canShowInsights = !isStudent || Boolean(evaluation.priGatewayPassed ?? (evaluation.overallStatus !== 'fail'));

    // 9. Resolve AI Insights from persisted evaluation data only.
    // Regeneration is handled explicitly via admin endpoint:
    // POST /api/admin/reports/:id/regenerate
    const insightsBaseUrl = process.env.INSIGHTS_SERVICE_URL || process.env.STUDENT_INSIGHTS_SERVICE_URL;
    const normalizedInsightsBaseUrl = insightsBaseUrl?.replace(/\/+$/, '') ?? '';
    const fallbackInsightsUrl = `${request.nextUrl.origin}/api/insights/${encodeURIComponent(String(response.studentUserId))}`;
    const insightsUrl = normalizedInsightsBaseUrl
      ? `${normalizedInsightsBaseUrl}/insights/${encodeURIComponent(String(response.studentUserId))}`
      : fallbackInsightsUrl;
    const insightsSource = normalizedInsightsBaseUrl ? 'external' : 'internal';

    let savedInsights = evaluation.aiInsights as Record<string, any> | undefined;
    let insightsError: string | null = null;
    let insightsStatus: 'ok' | 'missing' = savedInsights ? 'ok' : 'missing';
    const insightsHeaders: Record<string, string> = {};
    if (authHeader) insightsHeaders.Authorization = authHeader;

    // If this evaluation doesn't have saved insights yet, fetch once and persist.
    if (!savedInsights && canShowInsights) {
      try {
        const insightsRes = await Promise.race([
          fetch(insightsUrl, { headers: insightsHeaders }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Insights service timeout')), 15000)
          ),
        ]) as Response;

        if (insightsRes.ok) {
          const fetchedInsights = await insightsRes.json() as Record<string, any>;
          savedInsights = fetchedInsights;
          insightsStatus = 'ok';

          if (evaluation?._id) {
            await PriTestEvaluation.findByIdAndUpdate(evaluation._id, {
              aiInsights: fetchedInsights,
              insightsFetchedAt: new Date(),
            });
          }
        } else {
          const body = await insightsRes.text();
          insightsError = `Insights fetch failed (${insightsRes.status})${body ? `: ${body.slice(0, 200)}` : ''}`;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Insights fetch failed';
        console.warn('[report] insights fetch failed (non-blocking):', error);
        insightsError = errorMessage;
      }
    }

    if (!savedInsights) {
      insightsStatus = 'missing';
    }

    // Handle both payload styles:
    // 1) savedInsights = entire insights response { ..., aiInsights: { ... } }
    // 2) savedInsights = aiInsights object directly { summaryInsight, domains, ... }
    const normalizedSavedInsights = canShowInsights
      ? (normalizeInsightsPayload(savedInsights) ?? savedInsights)
      : null;
    const normalizedAiInsights: Record<string, any> | undefined =
      normalizedSavedInsights?.aiInsights && typeof normalizedSavedInsights.aiInsights === 'object'
        ? normalizedSavedInsights.aiInsights
        : normalizedSavedInsights;

    const summaryInsight: string =
      normalizedAiInsights?.summaryInsight ||
      normalizedAiInsights?.summary ||
      normalizedAiInsights?.insight ||
      '';

    const normalizeDomainKey = (value: string) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const getDomainInsight = (domainName: string): Record<string, any> | undefined => {
      const domainsObj = normalizedAiInsights?.domains as Record<string, any> | undefined;
      if (!domainsObj) return undefined;

      if (domainsObj[domainName]) return domainsObj[domainName];

      const normalizedLookup = normalizeDomainKey(domainName);
      for (const [key, value] of Object.entries(domainsObj)) {
        if (normalizeDomainKey(key) === normalizedLookup) return value as Record<string, any>;
      }

      return undefined;
    };

    // Merge per-domain AI insights from saved payload into mapped domains.
    const domainsWithInsights = mappedDomains.map((dom: any) => {
      const domainKey = normalizeDomainKey(dom.name || '');
      const aiDomainPlan =
        getDomainInsight(dom.name || '') ||
        normalizedAiInsights?.domainInsights?.[domainKey] ||
        normalizedAiInsights?.[domainKey];

      const aiActionPlan = aiDomainPlan?.actionPlan || aiDomainPlan;

      return {
        ...dom,
        description: aiDomainPlan?.description || '',
        insights: aiDomainPlan?.insights || aiDomainPlan?.insight || '',
        strengths: Array.isArray(aiDomainPlan?.strengths) && aiDomainPlan.strengths.length > 0
          ? aiDomainPlan.strengths
          : [],
        improvements: Array.isArray(aiDomainPlan?.improvements) && aiDomainPlan.improvements.length > 0
          ? aiDomainPlan.improvements
          : [],
        actionPlan: aiDomainPlan
          ? {
              high: aiActionPlan?.high || { title: '', steps: [] },
              medium: aiActionPlan?.medium || { title: '', steps: [] },
              low: aiActionPlan?.low || { title: '', steps: [] },
            }
          : {
              high: { title: '', steps: [] },
              medium: { title: '', steps: [] },
              low: { title: '', steps: [] },
            },
        aiInsight: aiDomainPlan?.insights || aiDomainPlan?.insight || aiDomainPlan?.summary || null,
      };
    });

    const answersByQuestionIndex = new Map<number, any>();
    for (const ans of response.answers || []) {
      if (typeof ans?.questionIndex === 'number') {
        answersByQuestionIndex.set(ans.questionIndex, ans);
      }
    }

    const questionBankDoc = await QuestionBank.findById(response.questionBankId)
      .select('questions')
      .lean() as any;
    const priTestBankDoc = !questionBankDoc
      ? await PriTestBank.findById(response.questionBankId).select('questions').lean() as any
      : null;
    const bankQuestions = (questionBankDoc?.questions || priTestBankDoc?.questions || []) as Array<Record<string, any>>;

    // Answer key removed from student report for security/privacy

    // 10. Build Final Object
    const reportData = {
      studentInfo: {
        name: student?.fullName || response.studentName || 'Student',
        id: response.studentId || student?.studentId || 'N/A',
        program: response.programme || student?.department || 'MBA',
        batch: response.batch || '2024-26',
        school: institution?.name || 'Grad360 Partner',
        examName: response.bankTitle || 'Placement Readiness Index',
        examId: response.responseCode || 'PRI-TEST',
        date: evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleDateString() : 'N/A',
        generated: evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · Report Generated' : 'Report Generated',
        priScore: truncateToOneDecimal(ensuredPriPercentage),
        performanceBand: overallBand.label
      },
      overallMetrics: {
        score: totalCorrectFromDomains,
        maxScore: totalQuestionsFromDomains,
        percentage: truncateToOneDecimal(ensuredPriPercentage),
        band: overallBand.label,
        totalQuestions: totalQuestionsFromDomains,
        correctAnswers: totalCorrectFromDomains,
        accuracy: truncateToOneDecimal(rawAccuracy),
        timeTaken: timeTakenStr,
        timeEfficiency: timeEfficiencyStr,
        timeEfficiencyLabel: timeEfficiencyLabel,
        attemptStrategy: {
          label: strategyLabel,
          description: strategyDesc,
          attemptRate: truncateToOneDecimal(overallAttemptRate),
          precision: truncateToOneDecimal(overallPrecision)
        },
        needsAttention: totalQuestionsFromDomains - totalCorrectFromDomains,
        estTotalTime: estTotalTimeStr,
        percentileRank: percentileRankStr
      },
      domains: domainsWithInsights,
      summaryInsight,
      aiInsights: canShowInsights ? (normalizedSavedInsights ?? null) : null,
      psychometric: psychometric.length > 0 ? psychometric : null,
      overallStatus: evaluation.overallStatus,
      priGatewayPassed: evaluation.priGatewayPassed ?? true,
      mcqPriScore: evaluation.mcqPriScore ?? 0,
      writtenPriScore: evaluation.writtenPriScore ?? 0,
      psychometricPriScore: 0,
      evaluatedAt: evaluation.evaluatedAt,
      insightsDiagnostics: isAdmin ? {
        status: insightsStatus,
        source: insightsSource,
        error: insightsError,
      } : null
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('[GET /api/student/reports/[id]]', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
