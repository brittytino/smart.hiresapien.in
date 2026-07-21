import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Institution from '@/models/Institution';
import UserAccount from '@/models/UserAccount';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import PriTestResponse from '@/models/PriTestResponse';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import PsychometricResult from '@/models/PsychometricResult';
import StudentResponse from '@/models/StudentResponse';
import QuestionBankAttempt from '@/models/QuestionBankAttempt';
import { getAdminFromAuthHeader } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const institutionName = typeof body.institutionName === 'string' ? body.institutionName.trim() : '';
  const institutionCode = typeof body.institutionCode === 'string' ? body.institutionCode.trim().toUpperCase() : '';
  const facultySlotLimit =
    typeof body.facultySlotLimit === 'number' ? body.facultySlotLimit : Number(body.facultySlotLimit);
  const studentSlotLimit =
    typeof body.studentSlotLimit === 'number' ? body.studentSlotLimit : Number(body.studentSlotLimit);

  if (!institutionName || !institutionCode) {
    return NextResponse.json({ error: 'institutionName and institutionCode are required' }, { status: 400 });
  }

  if (
    !Number.isFinite(facultySlotLimit) ||
    facultySlotLimit < 0 ||
    !Number.isFinite(studentSlotLimit) ||
    studentSlotLimit < 0
  ) {
    return NextResponse.json({ error: 'Slot limits must be non-negative numbers' }, { status: 400 });
  }

  try {
    await connectDB();

    const institutionId = new mongoose.Types.ObjectId(id);
    const existing = await Institution.findById(institutionId);
    if (!existing) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const duplicateCode = await Institution.findOne({
      _id: { $ne: institutionId },
      code: institutionCode,
    }).lean();

    if (duplicateCode) {
      return NextResponse.json({ error: 'Institution code already exists' }, { status: 409 });
    }

    const [currentFacultyCount, currentStudentCount] = await Promise.all([
      UserAccount.countDocuments({ institutionId, role: 'faculty' }),
      UserAccount.countDocuments({ institutionId, role: 'student' }),
    ]);

    if (facultySlotLimit < currentFacultyCount) {
      return NextResponse.json(
        { error: `Faculty slots cannot be less than current faculty count (${currentFacultyCount})` },
        { status: 400 }
      );
    }

    if (studentSlotLimit < currentStudentCount) {
      return NextResponse.json(
        { error: `Student slots cannot be less than current student count (${currentStudentCount})` },
        { status: 400 }
      );
    }

    existing.name = institutionName;
    existing.code = institutionCode;
    existing.facultySlotLimit = facultySlotLimit;
    existing.studentSlotLimit = studentSlotLimit;
    await existing.save();

    return NextResponse.json({ institution: existing.toJSON() }, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/admin/institutions/[id]]', error);
    return NextResponse.json({ error: 'Failed to update institution' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 });
  }

  try {
    await connectDB();

    const institutionId = new mongoose.Types.ObjectId(id);
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const [
      userCount,
      sharedQuestionBanks,
      sharedPriTestBanks,
      priResponses,
      priEvaluations,
      psychometricResults,
      studentResponses,
      questionBankAttempts,
    ] = await Promise.all([
      UserAccount.countDocuments({ institutionId }),
      QuestionBank.countDocuments({ 'institutions.institutionId': institutionId }),
      PriTestBank.countDocuments({ 'institutions.institutionId': institutionId }),
      PriTestResponse.countDocuments({ institutionId }),
      PriTestEvaluation.countDocuments({ institutionId }),
      PsychometricResult.countDocuments({ institutionId }),
      StudentResponse.countDocuments({ institutionId }),
      QuestionBankAttempt.countDocuments({ institutionId }),
    ]);

    if (
      userCount > 0 ||
      sharedQuestionBanks > 0 ||
      sharedPriTestBanks > 0 ||
      priResponses > 0 ||
      priEvaluations > 0 ||
      psychometricResults > 0 ||
      studentResponses > 0 ||
      questionBankAttempts > 0
    ) {
      return NextResponse.json(
        {
          error:
            'Cannot delete institution with existing users, shares, or assessment history. Remove dependent records first.',
        },
        { status: 409 }
      );
    }

    await Institution.deleteOne({ _id: institutionId });

    return NextResponse.json({ message: 'Institution deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/admin/institutions/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete institution' }, { status: 500 });
  }
}
