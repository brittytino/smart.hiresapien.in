const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const CONFIRM_FLAG = '--confirm';
const BATCH_SIZE = 500;

if (!MONGO_URI) {
  console.error('[backfill-archives] MONGO_URI environment variable is not defined.');
  process.exit(1);
}

if (!process.argv.includes(CONFIRM_FLAG)) {
  console.error(`[backfill-archives] Refusing to run without ${CONFIRM_FLAG}.`);
  process.exit(1);
}

const ContributorQuestionSchema = new mongoose.Schema({}, { strict: false, collection: 'contributor_questions' });
const QuestionSchema = new mongoose.Schema({}, { strict: false, collection: 'questions' });
const QuestionArchiveSchema = new mongoose.Schema({}, { strict: false, collection: 'question_archives' });

const ContributorQuestion = mongoose.model('ContributorQuestionBackfill', ContributorQuestionSchema);
const Question = mongoose.model('QuestionBackfill', QuestionSchema);
const QuestionArchive = mongoose.model('QuestionArchiveBackfill', QuestionArchiveSchema);

async function backfillCollection({ sourceCollection, Model }) {
  const total = await Model.countDocuments({});
  let processed = 0;

  while (processed < total) {
    const docs = await Model.find({}).sort({ _id: 1 }).skip(processed).limit(BATCH_SIZE).lean();
    if (docs.length === 0) break;

    const payloads = docs.map((doc) => ({
      sourceCollection,
      sourceId: doc._id,
      archivedAt: new Date(),
      payload: doc,
    }));

    await QuestionArchive.insertMany(payloads, { ordered: false });
    processed += docs.length;

    console.log(`[backfill-archives] ${sourceCollection}: ${processed}/${total}`);
  }
}

async function run() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });

  console.log('[backfill-archives] Starting backfill...');
  await backfillCollection({ sourceCollection: 'questions', Model: Question });
  await backfillCollection({ sourceCollection: 'contributor_questions', Model: ContributorQuestion });

  await mongoose.disconnect();
  console.log('[backfill-archives] Done.');
}

run().catch((error) => {
  console.error('[backfill-archives] Failed:', error);
  mongoose.disconnect().finally(() => process.exit(1));
});
