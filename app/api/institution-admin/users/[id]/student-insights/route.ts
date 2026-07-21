import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import { TestAttempt } from '@/models/PriTest';
import PriTestBank from '@/models/PriTestBank';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';
import mongoose from 'mongoose';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const admin = getInstitutionAdminFromAuthHeader(req.headers.get('Authorization'));
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    await connectDB();

    const user = await UserAccount.findOne({
      _id: id,
      institutionId: admin.institutionId,
      role: 'student'
    });

    if (!user) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Aggregate Student Test Insights from real Evaluations
    const stats = await PriTestEvaluation.aggregate([
      { $match: { studentUserId: user._id } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          highestScore: { $max: '$percentage' },
          averageScore: { $avg: '$percentage' },
        }
      }
    ]);

    const recentActivity = await PriTestEvaluation.find({ studentUserId: user._id })
      .sort({ evaluatedAt: -1 })
      .limit(5)
      .select('percentage evaluatedAt responseId')
      .lean();

    const insights = stats[0] || {
      totalTests: 0,
      highestScore: 0,
      averageScore: 0
    };

    // Fetch the latest evaluation for detailed metrics
    const latestEval = await PriTestEvaluation.findOne({ studentUserId: user._id })
      .sort({ evaluatedAt: -1 })
      .lean() as any;

    let radarData: any = [];
    let masteryScores: any = {};
    let behavioralProfile = "Developing";
    let alignment = 0;
    let latestReportId = null;
    let latestEvalDate = null;
    let latestTestName = "General Assessment";

    if (latestEval) {
      latestReportId = latestEval.responseId;
      latestEvalDate = latestEval.evaluatedAt || latestEval.createdAt;
      alignment = Math.round(latestEval.percentage || 0);
      const isFailed = (latestEval.overallStatus || '').toLowerCase() === 'fail';
      
      // 4-tier behavioral banding synchronized with StudentDashboard.tsx
      if (isFailed) behavioralProfile = "Developing";
      else if (alignment >= 90) behavioralProfile = "Exceptional";
      else if (alignment >= 80) behavioralProfile = "Ready";
      else if (alignment >= 60) behavioralProfile = "Almost Ready";
      else behavioralProfile = "Developing";

      if (latestEval.questionBankId) {
        const testBank = await PriTestBank.findById(latestEval.questionBankId).lean();
        if (testBank) latestTestName = testBank.title;
      }

      // Map domains to standard radar axes
      // Typical axes: Aptitude, Technical, Coding, Comm, Projects, Domain
      const domainMap: Record<string, string> = {
        'cognitiveintelligence': 'Cognitive',
        'problemsolving': 'Problem Solving',
        'communication': 'Communication',
        'businessintelligence': 'Business',
        'digitalbusiness': 'Digital',
        'leadership': 'Leadership', 
      };

      const scores: Record<string, number[]> = {
        'Cognitive': [],
        'Digital': [],
        'Problem Solving': [],
        'Communication': [],
        'Leadership': [],
        'Business': []
      };

      const axes = ['Cognitive', 'Digital', 'Problem Solving', 'Communication', 'Leadership', 'Business'];
      const aggregatedScores: Record<string, number[]> = {};
      axes.forEach(a => aggregatedScores[a] = []);

      (latestEval.domains || []).forEach((dom: any) => {
        const normalized = dom.domainName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const axis = domainMap[normalized] || 'Digital';
        
        let pct = 0;
        if (dom.domainShare > 0) {
          pct = (dom.score / dom.domainShare) * 100;
        } else if (dom.total > 0) {
          pct = (dom.correct / dom.total) * 100;
        } else {
          pct = dom.score || 0;
        }
        
        if (aggregatedScores[axis]) {
          aggregatedScores[axis].push(Math.round(pct));
        }
      });

      radarData = axes.map(axis => {
        const vals = aggregatedScores[axis];
        const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        const rounded = Math.round(avg);
        masteryScores[axis] = rounded;
        return { name: axis, score: rounded };
      });
    } else {
      // Defaults
      const axes = ['Cognitive', 'Digital', 'Problem Solving', 'Communication', 'Leadership', 'Business'];
      radarData = axes.map(a => ({ name: a, score: 0 }));
      axes.forEach(a => masteryScores[a] = 0);
    }

    return NextResponse.json({
      user: {
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        studentId: user.studentId
      },
      insights: {
        totalTests: insights.totalTests,
        highestScore: Math.round(insights.highestScore || 0),
        averageScore: Math.round(insights.averageScore || 0),
        radarData,
        masteryScores,
        behavioralProfile,
        alignment,
        latestReportId,
        latestEvalDate,
        latestTestName,
        traitResults: latestEval.traitResults ? 
          (latestEval.traitResults instanceof Map ? 
            Object.fromEntries(latestEval.traitResults) : 
            latestEval.traitResults) : null
      },
      recentActivity: recentActivity.map((r: any) => ({
        _id: r._id,
        percentage: r.percentage,
        submittedAt: r.evaluatedAt || r.createdAt,
        score: Math.round(r.percentage), // Fallback
        totalQuestions: 100 // Estimate
      }))
    });


  } catch (error) {
    console.error('Student Insights API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
