import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import PriTestBank from '@/models/PriTestBank';
import { getAdminFromAuthHeader, getInstitutionAdminFromAuthHeader } from '@/lib/auth';

function parseDate(value: unknown): Date | null {
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

/**
 * POST /api/admin/pri-tests/[id]/publish
 * Handles two actions:
 * 1) Publish test results (if `publish` boolean is in body)
 * 2) Publish test bank & share with institutions (if `institutions` array is in body)
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  const institutionAdmin = !admin ? getInstitutionAdminFromAuthHeader(request.headers.get('Authorization')) : null;
  
  if (!admin && !institutionAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid test ID' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    await connectDB();

    // --------------------------------------------------------------------------------
    // PATH 1: PUBLISH RESULTS (If `publish` boolean is provided)
    // --------------------------------------------------------------------------------
    if (typeof body.publish === 'boolean') {
      const publish = body.publish;
      const query: any = { _id: id };
      
      // If institution admin, ensure they only publish for their own institution
      if (institutionAdmin) {
        query['institutions.institutionId'] = new mongoose.Types.ObjectId(institutionAdmin.institutionId);
      }

      const testBank = await PriTestBank.findOne(query);
      if (!testBank) {
        return NextResponse.json({ error: 'Test bank not found or unauthorized' }, { status: 404 });
      }

      // Update the isResultsPublished flag for all matching institutions in the array
      let updated = false;
      testBank.institutions.forEach((inst: any) => {
        // If super admin, publish for all. If institution admin, only for theirs.
        if (!institutionAdmin || inst.institutionId.toString() === institutionAdmin.institutionId) {
          inst.isResultsPublished = !!publish;
          updated = true;
        }
      });

      if (updated) {
        // If results are published, the whole test is effectively completed
        if (publish) {
          testBank.status = 'completed';
        } else {
          // If we unpublish, it might be that we still want students to be able to finish, 
          // although typically unpublishing is for correction.
          testBank.status = 'published';
        }
        await testBank.save();
        try {
          const qBank = await QuestionBank.findById(id);
          if (qBank) {
            let qUpdated = false;
            qBank.institutions.forEach((inst: any) => {
              if (!institutionAdmin || inst.institutionId.toString() === institutionAdmin.institutionId) {
                inst.isResultsPublished = !!publish;
                qUpdated = true;
              }
            });
            if (qUpdated) {
              if (publish) qBank.status = 'completed';
              else qBank.status = 'published';
              await qBank.save();
            }
          }
        } catch (err) {
          console.warn('[publish] Failed to sync QuestionBank publication state:', err);
        }
      }

      return NextResponse.json({ 
        success: true, 
        isResultsPublished: !!publish,
        message: publish ? 'Results published' : 'Results unpublished' 
      });
    }

    // --------------------------------------------------------------------------------
    // PATH 2: PUBLISH TEST BANK (Only admins allowed)
    // --------------------------------------------------------------------------------
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized to publish test bank' }, { status: 403 });
    }

    const institutionsInput = Array.isArray(body.institutions) ? body.institutions : [];
    if (institutionsInput.length === 0) {
      return NextResponse.json({ error: 'At least one institution is required before publishing' }, { status: 400 });
    }

    const institutions = institutionsInput
      .map((entry) => {
        if (typeof entry !== 'object' || entry === null) return null;
        const record = entry as Record<string, unknown>;
        const institutionId = typeof record.institutionId === 'string' ? record.institutionId : '';
        const examStartDate = parseDate(record.examStartDate);
        const examEndDate = parseDate(record.examEndDate);

        if (!institutionId || !mongoose.Types.ObjectId.isValid(institutionId)) return null;
        if (!examStartDate || !examEndDate) return null;
        if (examEndDate < examStartDate) return null;

        // Adjust end date to the end of its day (11:59:59 PM)
        const adjustedEndDate = new Date(examEndDate);
        adjustedEndDate.setHours(23, 59, 59, 999);

        return {
          institutionId: new mongoose.Types.ObjectId(institutionId),
          status: 'pending' as const,
          examStartDate,
          examEndDate: adjustedEndDate,
          sharedAt: new Date(),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    if (institutions.length === 0) {
      return NextResponse.json({ error: 'Invalid institution share data' }, { status: 400 });
    }

    const bank = await QuestionBank.findById(id);
    if (!bank) return NextResponse.json({ error: 'Question bank not found' }, { status: 404 });

    if (bank.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft question banks can be published' }, { status: 400 });
    }

    if (Array.isArray(body.questions) && body.questions.length > 0) {
      bank.questions = body.questions as any;
    }

    bank.institutions = institutions as any;
    bank.status = 'published';

    await bank.save();

    await PriTestBank.findOneAndUpdate(
      { _id: bank._id },
      {
        status: 'published',
        institutions: institutions as any,
        ...(Array.isArray(body.questions) && body.questions.length > 0 ? { questions: body.questions } : {}),
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return NextResponse.json({ bank }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/admin/pri-tests/:id/publish]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
