import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import PriTestEvaluation from '@/models/PriTestEvaluation';
import PriTestResponse from '@/models/PriTestResponse';
import { evaluateMcqResponse } from '@/evaluation/pri-test-mcq';

function parseArg(name: string) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

async function run() {
  const responseId = parseArg('responseId');

  await connectDB();

  const filter: Record<string, unknown> = {
    status: 'submitted',
    evaluationStatus: 'pending',
  };

  if (responseId) {
    filter._id = responseId;
  }

  const responses = await PriTestResponse.find(filter).lean();
  if (responses.length === 0) {
    console.log('No pending responses found.');
    return;
  }

  for (const response of responses) {
    const bank = await QuestionBank.findById(response.questionBankId).lean();
    if (!bank) {
      console.warn(`Bank not found for response ${response._id}`);
      continue;
    }

    const evaluation = evaluateMcqResponse(bank as typeof bank, response as typeof response);
    const hasWritten = (response.answers ?? []).some((answer) => answer.questionType === 'written');

    await PriTestEvaluation.findOneAndUpdate(
      { responseId: response._id },
      {
        responseId: response._id,
        questionBankId: response.questionBankId,
        studentUserId: response.studentUserId,
        institutionId: response.institutionId,
        status: 'completed',
        mcqCorrect: evaluation.mcqCorrect,
        mcqTotal: evaluation.mcqTotal,
        totalScore: evaluation.totalScore,
        percentage: evaluation.percentage,
        domains: evaluation.domains,
        evaluatedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    await PriTestResponse.updateOne(
      { _id: response._id },
      { $set: { evaluationStatus: hasWritten ? 'pending' : 'reviewed' } }
    );

    console.log(`Evaluated response ${response._id} (score ${evaluation.totalScore})`);
  }
}

run().catch((error) => {
  console.error('Failed to evaluate MCQ:', error);
  process.exit(1);
});
