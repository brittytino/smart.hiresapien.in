import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import mongoose from 'mongoose';
import { getInstitutionAdminFromAuthHeader } from '@/lib/auth';

type InstitutionLifecycleStatus = 'Started' | 'Completed' | 'Evaluated' | 'Results Published';

/**
 * GET /api/institution-admin/pri-tests
 * Institution admin: list shared PRI tests for their institution.
 */
export async function GET(request: NextRequest) {
  const user = getInstitutionAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    const institutionObjectId = new mongoose.Types.ObjectId(user.institutionId);

    const banks = await QuestionBank.find({
      status: 'published',
      institutions: { $elemMatch: { institutionId: user.institutionId } },
    })
      .select('_id title program createdAt status institutions')
      .sort({ createdAt: -1 })
      .lean();

    const bankIds = banks.map((bank) => bank._id);

    const [submittedByBank, evaluatedByBank] = await Promise.all([
      PriTestResponse.aggregate([
        {
          $match: {
            institutionId: institutionObjectId,
            questionBankId: { $in: bankIds },
            status: { $in: ['submitted', 'closed'] },
          },
        },
        {
          $group: {
            _id: '$questionBankId',
            totalSubmitted: { $sum: 1 },
          },
        },
      ]),
      PriTestEvaluation.aggregate([
        {
          $match: {
            institutionId: institutionObjectId,
            questionBankId: { $in: bankIds },
          },
        },
        {
          $group: {
            _id: '$questionBankId',
            totalEvaluated: { $sum: 1 },
            avgScore: { $avg: '$percentage' },
          },
        },
      ]),
    ]);

    const submittedMap = new Map<string, number>(
      submittedByBank.map((row) => [String(row._id), Number(row.totalSubmitted) || 0])
    );

    const evaluatedMap = new Map<string, { totalEvaluated: number; avgScore: number }>(
      evaluatedByBank.map((row) => [
        String(row._id),
        {
          totalEvaluated: Number(row.totalEvaluated) || 0,
          avgScore: Number((Number(row.avgScore) || 0).toFixed(2)),
        },
      ])
    );

    const mapped = banks.map((bank) => {
      const share = bank.institutions.find(
        (entry) => String(entry.institutionId) === String(user.institutionId)
      );

      if (!share || share.status === 'rejected') {
        return null;
      }

      const totalSubmitted = submittedMap.get(String(bank._id)) ?? 0;
      const evaluatedSummary = evaluatedMap.get(String(bank._id));
      const totalEvaluated = evaluatedSummary?.totalEvaluated ?? 0;
      const avgScore = evaluatedSummary?.avgScore ?? 0;

      let lifecycleStatus: InstitutionLifecycleStatus = 'Started';
      if (share?.isResultsPublished) {
        lifecycleStatus = 'Results Published';
      } else if (totalEvaluated > 0) {
        lifecycleStatus = 'Evaluated';
      } else if (totalSubmitted > 0) {
        lifecycleStatus = 'Completed';
      }

      return {
        _id: bank._id,
        title: bank.title,
        program: bank.program,
        createdAt: bank.createdAt,
        status: bank.status,
        share,
        lifecycleStatus,
        canRespond: share?.status === 'pending',
        summary: {
          totalSubmitted,
          totalEvaluated,
          avgScore,
        },
      };
    }).filter((row): row is NonNullable<typeof row> => row !== null);

    return NextResponse.json({ banks: mapped }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/institution-admin/pri-tests]', error);
    return NextResponse.json({ error: 'Failed to fetch PRI tests' }, { status: 500 });
  }
}
