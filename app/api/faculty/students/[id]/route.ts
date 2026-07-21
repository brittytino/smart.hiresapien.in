import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import Batch from '@/models/Batch';
import { getFacultyFromAuthHeader } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const faculty = getFacultyFromAuthHeader(request.headers.get('Authorization'));
  if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid student id' }, { status: 400 });
  }

  try {
    await connectDB();

    const facultyUser = await UserAccount.findById(faculty.id).lean();
    if (!facultyUser) return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });

    const institutionObjectId = new mongoose.Types.ObjectId(faculty.institutionId);
    const assignedBatchesDocs = await Batch.find({ 
      institutionId: institutionObjectId, 
      assignedFaculty: facultyUser._id 
    }).select('name').lean();
    
    const assignedBatches = assignedBatchesDocs.map(b => b.name);

    const student = await UserAccount.findOne({
      _id: new mongoose.Types.ObjectId(id),
      institutionId: faculty.institutionId,
      role: 'student',
      ...(assignedBatches.length > 0 ? { batch: { $in: assignedBatches } } : { _id: { $in: [] } }),
    }).lean();

    if (!student) {
      return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
    }

    // Aggregate Student Test Insights from real Evaluations (same logic as admin)
    const stats = await PriTestEvaluation.aggregate([
      { $match: { studentUserId: student._id } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          highestScore: { $max: '$percentage' },
          averageScore: { $avg: '$percentage' },
        }
      }
    ]);

    const recentActivity = await PriTestEvaluation.find({ studentUserId: student._id })
      .sort({ evaluatedAt: -1 })
      .limit(5)
      .select('percentage evaluatedAt responseId')
      .lean();

    const statsData = stats[0] || {
      totalTests: 0,
      highestScore: 0,
      averageScore: 0
    };

    const latestEval = await PriTestEvaluation.findOne({ studentUserId: student._id })
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
      latestReportId = String(latestEval.responseId);
      latestEvalDate = latestEval.evaluatedAt || latestEval.createdAt;
      alignment = Math.round(latestEval.percentage || 0);
      const isFailed = (latestEval.overallStatus || '').toLowerCase() === 'fail';
      
      if (isFailed) behavioralProfile = "Developing";
      else if (alignment >= 90) behavioralProfile = "Exceptional";
      else if (alignment >= 80) behavioralProfile = "Ready";
      else if (alignment >= 60) behavioralProfile = "Almost Ready";
      else behavioralProfile = "Developing";

      // Map domains to standard radar axes
      const domainMap: Record<string, string> = {
        'cognitiveintelligence': 'Cognitive',
        'problemsolving': 'Problem Solving',
        'communication': 'Communication',
        'businessintelligence': 'Business',
        'digitalbusiness': 'Digital',
        'leadership': 'Leadership', 
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
      const axes = ['Cognitive', 'Digital', 'Problem Solving', 'Communication', 'Leadership', 'Business'];
      radarData = axes.map(a => ({ name: a, score: 0 }));
      axes.forEach(a => masteryScores[a] = 0);
    }

    return NextResponse.json({
      user: {
        username: student.username,
        fullName: student.fullName,
        role: 'student',
        isActive: student.isActive,
        createdAt: student.createdAt,
        studentId: student.studentId
      },
      insights: {
        totalTests: statsData.totalTests,
        highestScore: Math.round(statsData.highestScore || 0),
        averageScore: Math.round(statsData.averageScore || 0),
        radarData,
        masteryScores,
        behavioralProfile,
        alignment,
        latestReportId,
        latestEvalDate,
        latestTestName,
        traitResults: latestEval?.traitResults ? 
          (latestEval.traitResults instanceof Map ? 
            Object.fromEntries(latestEval.traitResults) : 
            latestEval.traitResults) : null
      },
      recentActivity: recentActivity.map((r: any) => ({
        _id: String(r._id),
        percentage: r.percentage,
        submittedAt: r.evaluatedAt || r.createdAt,
        score: Math.round(r.percentage),
        totalQuestions: 100
      }))
    });
  } catch (error) {
    console.error('[GET /api/faculty/students/:id]', error);
    return NextResponse.json({ error: 'Failed to load student details' }, { status: 500 });
  }
}
