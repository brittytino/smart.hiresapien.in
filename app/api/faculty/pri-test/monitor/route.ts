import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import PriTestResponse from '@/models/PriTestResponse';
import UserAccount from '@/models/UserAccount';
import { getFacultyFromAuthHeader } from '@/lib/auth';

function parseTimeToToday(value: string): Date | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
}

function getActiveDomainId(domains: Array<{ domainId: string; domainStartTime: string; domainEndTime: string }>) {
  const now = new Date();
  for (const domain of domains) {
    const start = parseTimeToToday(domain.domainStartTime);
    const end = parseTimeToToday(domain.domainEndTime);
    if (!start || !end) continue;
    if (now >= start && now <= end) return domain.domainId;
  }
  return null;
}

/**
 * GET /api/faculty/pri-test/monitor
 * Faculty: monitor student PRI test progress for their institution.
 */
export async function GET(request: NextRequest) {
  const faculty = getFacultyFromAuthHeader(request.headers.get('Authorization'));
  if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    const students = await UserAccount.find({
      institutionId: faculty.institutionId,
      role: 'student',
    })
      .select('_id username fullName studentId')
      .lean();

    const studentIds = students.map((student) => student._id);

    const now = new Date();
    const bank = await QuestionBank.findOne({
      status: 'published',
      institutions: {
        $elemMatch: {
          institutionId: faculty.institutionId,
          status: 'accepted',
          examEndDate: { $gte: now },
        },
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!bank) {
      return NextResponse.json({
        bank: null,
        students: students.map((student) => ({
          id: String(student._id),
          username: student.username,
          fullName: student.fullName,
          studentId: student.studentId,
        })),
        progress: [],
      });
    }

    const responses = await PriTestResponse.find({
      questionBankId: bank._id,
      institutionId: new mongoose.Types.ObjectId(faculty.institutionId),
      studentUserId: { $in: studentIds },
    })
      .sort({ lastActiveAt: -1 })
      .lean();

    const responseMap = new Map(responses.map((response) => [String(response.studentUserId), response]));
    const activeDomainId = getActiveDomainId(bank.domains ?? []);

    const domainNameMap = new Map((bank.domains ?? []).map((domain) => [domain.domainId, domain.domainName]));
    const totalQuestions = (bank.questions ?? []).length;

    const progress = students.map((student) => {
      const response = responseMap.get(String(student._id));
      const answeredCount = response?.answers?.length ?? 0;
      const currentDomainId = response?.currentDomainId ?? activeDomainId;
      const currentDomainName = currentDomainId ? (domainNameMap.get(currentDomainId) ?? currentDomainId) : null;

      return {
        student: {
          id: String(student._id),
          username: student.username,
          fullName: student.fullName,
          studentId: student.studentId,
        },
        status: response?.status ?? 'not_started',
        answeredCount,
        unansweredCount: Math.max(totalQuestions - answeredCount, 0),
        currentDomainId,
        currentDomainName,
        lastActiveAt: response?.lastActiveAt ?? null,
        submittedAt: response?.submittedAt ?? null,
      };
    });

    return NextResponse.json({
      bank: {
        id: String(bank._id),
        title: bank.title,
        program: bank.program,
      },
      progress,
    });
  } catch (error) {
    console.error('[GET /api/faculty/pri-test/monitor]', error);
    return NextResponse.json({ error: 'Failed to fetch PRI monitoring data' }, { status: 500 });
  }
}
