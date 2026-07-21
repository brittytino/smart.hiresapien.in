const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const CONFIRM_FLAG = '--confirm';

if (!MONGO_URI) {
  console.error('[killer] MONGO_URI environment variable is not defined.');
  process.exit(1);
}

if (!process.argv.includes(CONFIRM_FLAG)) {
  console.error(`[killer] Refusing to run without ${CONFIRM_FLAG}.`);
  process.exit(1);
}

const ContributorQuestionSchema = new mongoose.Schema({}, { strict: false, collection: 'contributor_questions' });
const QuestionSchema = new mongoose.Schema({}, { strict: false, collection: 'questions' });

const ContributorQuestion = mongoose.model('ContributorQuestionPurge', ContributorQuestionSchema);
const Question = mongoose.model('QuestionPurge', QuestionSchema);

async function purge() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });

  const contributorResult = await ContributorQuestion.deleteMany({});
  const questionResult = await Question.deleteMany({});

  console.log('[killer] Deleted contributor_questions:', contributorResult.deletedCount ?? 0);
  console.log('[killer] Deleted questions:', questionResult.deletedCount ?? 0);

  await mongoose.disconnect();
}

purge().catch((error) => {
  console.error('[killer] Failed to purge collections:', error);
  mongoose.disconnect().finally(() => process.exit(1));
});
