import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import UserAccount from '@/models/UserAccount';
import QuestionBank from '@/models/QuestionBank';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import ContributorQuestion from '@/models/ContributorQuestion';
import PriTestBank from '@/models/PriTestBank';
import Batch from '@/models/Batch';
import Institution from '@/models/Institution';
import { getFacultyFromAuthHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const faculty = getFacultyFromAuthHeader(req.headers.get('Authorization'));
    if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const facultyRecord = await UserAccount.findById(faculty.id).populate('institutionId', 'name');
    if (!facultyRecord) return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });

    const institutionName = (facultyRecord?.institutionId as any)?.name || '';
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { searchParams } = new URL(req.url);
    const selectedBatch = searchParams.get('batch');

    // 0. Get assigned batches from new source of truth (Batch model)
    const institutionObjectId = new mongoose.Types.ObjectId(faculty.institutionId);
    const assignedBatchesDocs = await Batch.find({ 
      institutionId: institutionObjectId, 
      assignedFaculty: facultyRecord._id 
    }).select('name').lean();
    
    const assignedBatchNames = assignedBatchesDocs.map(b => b.name);
    
    // Determine the active filter: either a specific selected batch or all assigned batches
    const activeBatchFilter = selectedBatch ? [selectedBatch] : assignedBatchNames;

    // 1. Basic Stats (Filtered by Batch)
    const [totalStudents, activeStudents] = await Promise.all([
      UserAccount.countDocuments({ 
        institutionId: faculty.institutionId, 
        role: 'student',
        batch: { $in: activeBatchFilter }
      }),
      UserAccount.countDocuments({ 
        institutionId: faculty.institutionId, 
        role: 'student', 
        isActive: true,
        batch: { $in: activeBatchFilter }
      }),
    ]);

    // 2. Active Test & Session Stats (Institution wide for available tests, batch filtered for sessions)
    const totalTests = await QuestionBank.countDocuments({ 
      status: 'published',
      institutions: { $elemMatch: { institutionId: faculty.institutionId } }
    });

    const activeEvaluationsCount = await QuestionBank.countDocuments({
      status: 'published',
      institutions: {
        $elemMatch: {
          institutionId: faculty.institutionId,
          examStartDate: { $lte: now },
          examEndDate: { $gte: now }
        }
      }
    });

    const managedSessionsCount = await PriTestResponse.distinct('batch', {
      institutionId: faculty.institutionId,
      batch: { $in: activeBatchFilter },
      updatedAt: { $gte: thirtyDaysAgo }
    }).then(list => list.length);

    // 2.5 Find Last PRI Exam context
    const latestExamEval = await PriTestEvaluation.findOne({
      institutionId: institutionObjectId,
      batch: { $in: activeBatchFilter }
    })
      .sort({ evaluatedAt: -1 })
      .select('questionBankId evaluatedAt')
      .populate('questionBankId', 'title')
      .lean();

    const lastExamId = latestExamEval?.questionBankId?._id;
    const lastExamTitle = (latestExamEval?.questionBankId as any)?.title || 'Latest PRI Exam';
    const lastExamDate = latestExamEval?.evaluatedAt;

    // 3. Performance Stats (Aggregations Filtered by Batch AND Last Exam)
    const performanceFilter: any = { 
      institutionId: institutionObjectId,
      batch: { $in: activeBatchFilter }
    };
    if (lastExamId) performanceFilter.questionBankId = lastExamId;

    const [performanceStats, lastMonthStats, uniqueStudentsTested] = await Promise.all([
      PriTestEvaluation.aggregate([
        { $match: performanceFilter },
        {
          $group: {
            _id: null,
            avgReadiness: { $avg: '$percentage' },
            placementReadyCount: {
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $gte: ['$percentage', 70] },
                      { $eq: ['$overallStatus', 'pass'] }
                    ]
                  }, 
                  1, 
                  0
                ] 
              }
            }
          }
        }
      ]),
      PriTestEvaluation.aggregate([
        { 
          $match: { 
            ...performanceFilter,
            evaluatedAt: { 
              $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), 
              $lt: thirtyDaysAgo 
            } 
          } 
        },
        { $group: { _id: null, avg: { $avg: '$percentage' } } }
      ]),
      PriTestResponse.distinct('studentUserId', { 
        institutionId: faculty.institutionId,
        batch: { $in: activeBatchFilter },
        status: 'submitted',
        ...(lastExamId ? { testId: lastExamId } : {})
      })
    ]);

    const { avgReadiness = 0, placementReadyCount = 0 } = performanceStats[0] || {};
    const lastMonthAvg = lastMonthStats[0]?.avg || 0;
    
    const growth = lastMonthAvg > 0 
      ? Math.trunc(((avgReadiness - lastMonthAvg) / lastMonthAvg) * 100 * 100) / 100
      : 0;

    const participationRate = totalStudents > 0 
      ? Math.trunc((uniqueStudentsTested.length / totalStudents) * 10000) / 100
      : 0;

    // 4. Batch Readiness & Visualizations
    const results = await Promise.all([
      PriTestResponse.aggregate([
        {
          $match: {
            institutionId: institutionObjectId,
            batch: { $in: activeBatchFilter },
            status: 'submitted',
            ...(lastExamId ? { testId: lastExamId } : {})
          }
        },
        {
          $lookup: {
            from: 'pri_test_evaluations',
            localField: '_id',
            foreignField: 'responseId',
            as: 'evaluation'
          }
        },
        { $unwind: '$evaluation' },
        {
          $group: {
            _id: '$batch',
            averageScore: { $avg: '$evaluation.percentage' }
          }
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            score: '$averageScore'
          }
        },
        { $sort: { name: 1 } },
        { $limit: 10 }
      ]),
      // Score Distribution (0-10, 10-20, ... 90-100)
      PriTestEvaluation.aggregate([
        { 
          $match: performanceFilter 
        },
        {
          $project: {
            bucket: {
              $let: {
                vars: {
                  b: { $min: [{ $floor: { $divide: ['$percentage', 10] } }, 9] }
                },
                in: {
                  $concat: [
                    { $toString: { $multiply: ['$$b', 10] } },
                    '-',
                    { $toString: { $add: [{ $multiply: ['$$b', 10] }, 10] } }
                  ]
                }
              }
            },
            sortKey: { $min: [{ $floor: { $divide: ['$percentage', 10] } }, 9] }
          }
        },
        {
          $group: {
            _id: '$bucket',
            count: { $sum: 1 },
            sortKey: { $first: '$sortKey' }
          }
        },
        { $sort: { sortKey: 1 } }
      ]),
      // Domain Performance Analysis
      PriTestEvaluation.aggregate([
        { 
          $match: performanceFilter 
        },
        { $unwind: '$domains' },
        {
          $group: {
            _id: '$domains.domainName',
            totalScore: { $sum: '$domains.score' },
            totalShare: { $sum: '$domains.domainShare' }
          }
        },
        {
          $project: {
            domain: '$_id',
            score: { 
              $cond: [
                { $multiply: [{ $divide: ['$totalScore', '$totalShare'] }, 100] },
                0
              ]
            },
            _id: 0
          }
        },
        { $sort: { score: -1 } }
      ]),
      // Urgent Students (At Risk)
      PriTestEvaluation.aggregate([
        { 
          $match: {
            ...performanceFilter,
            $or: [
              { percentage: { $lt: 60 } },
              { overallStatus: 'fail' }
            ]
          }
        },
        { $sort: { percentage: 1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'user_accounts',
            localField: 'studentUserId',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        {
          $project: {
            id: '$studentUserId',
            username: '$student.username',
            fullName: '$student.fullName',
            percentage: 1,
            overallStatus: 1,
            evaluatedAt: 1,
            _id: 0
          }
        }
      ]),
      // Top Subskill Gaps
      PriTestEvaluation.aggregate([
        { $match: performanceFilter },
        { $unwind: '$domains' },
        { $unwind: '$domains.subskills' },
        {
          $group: {
            _id: { domain: '$domains.domainName', subskill: '$domains.subskills.name' },
            avgAccuracy: { 
              $avg: { 
                $cond: [
                  { $gt: ['$domains.subskills.total', 0] },
                  { $multiply: [{ $divide: ['$domains.subskills.correct', '$domains.subskills.total'] }, 100] },
                  '$domains.subskills.score'
                ]
              } 
            }
          }
        },
        { $sort: { avgAccuracy: 1 } },
        { $limit: 5 },
        {
          $project: {
            domain: '$_id.domain',
            subskill: '$_id.subskill',
            accuracy: '$avgAccuracy',
            _id: 0
          }
        }
      ])
    ]);

    const batchReadiness = results[0];
    const scoreDistribution = results[1];
    const domainPerformance = results[2];
    const urgentStudents = results[3];
    const topSubskillGaps = results[4];

    // 5. Recent Activity (Filtered by Batch)
    const recentActivityRaw = await PriTestEvaluation.find({
      institutionId: faculty.institutionId,
      batch: { $in: activeBatchFilter }
    })
      .sort({ evaluatedAt: -1 })
      .limit(5)
      .lean();

    const studentUserIds = recentActivityRaw.map(a => a.studentUserId);
    const studentDocs = await UserAccount.find({ _id: { $in: studentUserIds } }).select('_id fullName username').lean();
    const studentMap = new Map(studentDocs.map(s => [String(s._id), s]));

    const recentActivity = recentActivityRaw.map(a => {
      const student = studentMap.get(String(a.studentUserId));
      return {
        _id: String(a._id),
        score: a.totalScore,
        totalQuestions: a.mcqTotal,
        percentage: a.percentage,
        submittedAt: (a as any).evaluatedAt || (a as any).createdAt,
        studentName: student ? (student.fullName || student.username) : 'Unknown Student'
      };
    });

    const activeDomains = await ContributorQuestion.distinct('domain', {
      contributorUsername: faculty.username,
    });

    const user = await UserAccount.findById(faculty.id).select('fullName username role').lean();
    const institution = await Institution.findById(faculty.institutionId).select('studentSlotLimit facultySlotLimit').lean();

    return NextResponse.json({
      user: {
        fullName: user?.fullName || user?.username || 'Faculty',
        username: user?.username || faculty.username,
        role: user?.role || 'faculty',
        institutionName: institutionName
      },
      assignedBatches: assignedBatchNames,
      selectedBatch,
      stats: {
        students: {
          total: totalStudents,
          active: activeStudents,
          limit: institution?.studentSlotLimit || 0
        },
        tests: {
          total: totalTests
        }
      },
      performance: {
        avgReadiness: Math.trunc(avgReadiness * 100) / 100,
        placementReadyCount,
        activeEvaluationsCount,
        managedSessionsCount,
        participationRate,
        growth
      },
      batchReadiness,
      scoreDistribution,
      domainPerformance,
      recentActivity,
      urgentStudents,
      topSubskillGaps,
      responsibleDomains: activeDomains,
      allottedStudents: totalStudents,
      averageScore: Math.trunc(avgReadiness * 100) / 100,
      passRate: participationRate,
      lastExam: lastExamId ? {
        id: String(lastExamId),
        title: lastExamTitle,
        date: lastExamDate
      } : null
    });

  } catch (error) {
    console.error('Faculty Insights API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

