import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriTestResponse from '@/models/PriTestResponse';
import { getAdminFromAuthHeader } from '@/lib/auth';
import { runAIEvaluation } from '@/lib/evaluation-engine';

export async function POST(request: NextRequest) {
  const admin = getAdminFromAuthHeader(request.headers.get('Authorization'));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    // Directly run AI evaluation logic since it's now internal to the project
    const data = await runAIEvaluation();
    
    if (!data.success || !data.results) {
      return NextResponse.json({ error: 'AI evaluation logic failed internally' }, { status: 500 });
    }

    let updatedCount = 0;

    // Process all results
    for (const result of data.results) {
      if (result.error) {
        console.error(`AI Evaluation skipped for response ${result.testResponseId}:`, result.error);
        continue;
      }

      const { testResponseId, questionId, evaluation } = result;

      // Find the response document
      const doc = await PriTestResponse.findById(testResponseId);
      if (!doc) continue;

      let hasUpdates = false;

      // Update the specific answer's AI evaluation
      if (doc.answers && Array.isArray(doc.answers)) {
        for (let i = 0; i < doc.answers.length; i++) {
          if (doc.answers[i].questionType === 'written' && doc.answers[i].questionId === questionId) {
            
            // Reconstruct evaluation to ensure it matches schema
            const aiEvaluationRaw = {
              scores: {
                task_completion: evaluation.scores?.task_completion || 0,
                clarity_and_brevity: evaluation.scores?.clarity_and_brevity || 0,
                logical_structure: evaluation.scores?.logical_structure || 0,
                professional_tone: evaluation.scores?.professional_tone || 0,
                critical_thinking: evaluation.scores?.critical_thinking || 0,
              },
              feedback: evaluation.feedback || '',
              averageScore: evaluation.averageScore || 0,
              evaluatedAt: new Date()
            };

            doc.answers[i].aiEvaluation = aiEvaluationRaw;
            doc.answers[i].evaluationStatus = 'auto';
            hasUpdates = true;
          }
        }
      }

      if (hasUpdates) {
        // Mark the 'answers' array as modified since it's a subdocument array
        doc.markModified('answers');
        await doc.save();
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${data.results.length} evaluations. Successfully updated ${updatedCount} records.`,
      details: data.results
    });

  } catch (error) {
    console.error('[POST /api/admin/evaluate-business]', error);
    return NextResponse.json({ error: 'Internal server error while evaluating business modules' }, { status: 500 });
  }
}
