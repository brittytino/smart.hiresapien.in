import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Institution from '@/models/Institution';
import UserAccount from '@/models/UserAccount';
import QuestionBank from '@/models/QuestionBank';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getInstitutionAdminFromAuthHeader(req.headers.get('Authorization'));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const institution = await Institution.findById(user.institutionId);
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Basic Stats
    const [totalFaculty, activeFaculty, totalStudents, activeStudents] = await Promise.all([
      UserAccount.countDocuments({ institutionId: user.institutionId, role: 'faculty' }),
      UserAccount.countDocuments({ institutionId: user.institutionId, role: 'faculty', isActive: true }),
      UserAccount.countDocuments({ institutionId: user.institutionId, role: 'student' }),
      UserAccount.countDocuments({ institutionId: user.institutionId, role: 'student', isActive: true }),
    ]);

    // 2. Active Test & Session Stats
    // Total assigned published tests
    const totalTests = await QuestionBank.countDocuments({ 
      status: 'published',
      institutions: { $elemMatch: { institutionId: user.institutionId } }
    });

    // Currently active tests based on date
    const activeEvaluationsCount = await QuestionBank.countDocuments({
      status: 'published',
      institutions: {
        $elemMatch: {
          institutionId: user.institutionId,
          examStartDate: { $lte: now },
          examEndDate: { $gte: now }
        }
      }
    });

    // Managed Sessions: Unique batches active in the last 30 days
    const managedSessionsCount = await PriTestResponse.distinct('batch', {
      institutionId: user.institutionId,
      updatedAt: { $gte: thirtyDaysAgo }
    }).then(list => list.length);

    // 3. Performance Stats (Aggregations)
    const [performanceStats, lastMonthStats, uniqueStudentsTested] = await Promise.all([
      PriTestEvaluation.aggregate([
        { $match: { institutionId: institution._id } },
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
      // Performance from 30-60 days ago for growth calculation
      PriTestEvaluation.aggregate([
        { 
          $match: { 
            institutionId: institution._id,
            evaluatedAt: { 
              $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), 
              $lt: thirtyDaysAgo 
            } 
          } 
        },
        { $group: { _id: null, avg: { $avg: '$percentage' } } }
      ]),
      // Real participation: unique students who have submitted at least one test
      PriTestResponse.distinct('studentUserId', { 
        institutionId: user.institutionId,
        status: 'submitted'
      })
    ]);

    const { avgReadiness = 0, placementReadyCount = 0 } = performanceStats[0] || {};
    const lastMonthAvg = lastMonthStats[0]?.avg || 0;
    
    // Calculate real growth %
    const growth = lastMonthAvg > 0 
      ? Math.round(((avgReadiness - lastMonthAvg) / lastMonthAvg) * 100 * 10) / 10
      : 0;

    const participationRate = totalStudents > 0 
      ? Math.round((uniqueStudentsTested.length / totalStudents) * 100) 
      : 0;

    // 4. Batch Readiness (Visualizations)
    const batchReadiness = await PriTestResponse.aggregate([
      {
        $match: {
          institutionId: institution._id,
          status: 'submitted',
          batch: { $exists: true, $ne: '', $type: 'string' }
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
      { $limit: 5 }
    ]);

    // 5. Recent Activity & Profile Info
    const [recentUsers, adminUser] = await Promise.all([
      UserAccount.find({ institutionId: user.institutionId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName username role createdAt studentId'),
      UserAccount.findById(user.id).select('fullName username role').lean()
    ]);

    return NextResponse.json({
      user: {
        fullName: adminUser?.fullName || adminUser?.username || 'Institution Admin',
        username: adminUser?.username || user.username,
        role: adminUser?.role || 'institution_admin',
        institutionName: institution.name
      },
      stats: {
        faculty: {
          total: totalFaculty,
          active: activeFaculty,
          limit: institution.facultySlotLimit,
        },
        students: {
          total: totalStudents,
          active: activeStudents,
          limit: institution.studentSlotLimit,
        },
        tests: {
          total: totalTests
        }
      },
      performance: {
        avgReadiness: avgReadiness,
        placementReadyCount,
        activeEvaluationsCount,
        managedSessionsCount,
        participationRate,
        growth
      },
      recentActivity: {
        users: recentUsers,
      },
      batchReadiness
    });

  } catch (error) {
    console.error('Institution Insights Error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
