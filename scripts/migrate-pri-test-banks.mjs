import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not defined');
}

const QuestionBankSchema = new mongoose.Schema({}, { strict: false, collection: 'question_banks' });
const PriTestBankSchema = new mongoose.Schema({}, { strict: false, collection: 'pri_test_banks' });

const QuestionBank = mongoose.model('QuestionBankLegacy', QuestionBankSchema);
const PriTestBank = mongoose.model('PriTestBankLegacy', PriTestBankSchema);

function normalizeDomains(domains) {
  if (!Array.isArray(domains)) return [];
  return domains.map((domain) => ({
    ...domain,
    domainStartTime: domain.domainStartTime ?? '00:00',
    domainEndTime: domain.domainEndTime ?? '23:59',
  }));
}

async function migrate() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });

  const banks = await QuestionBank.find({}).lean();
  if (banks.length === 0) {
    console.log('[migrate-pri-test-banks] No QuestionBank documents found.');
    await mongoose.disconnect();
    return;
  }

  const ops = banks.map((bank) => ({
    updateOne: {
      filter: { _id: bank._id },
      update: {
        $set: {
          title: bank.title,
          program: bank.program,
          status: bank.status ?? 'draft',
          domains: normalizeDomains(bank.domains),
          questions: bank.questions ?? [],
          institutions: bank.institutions ?? [],
          createdBy: bank.createdBy ?? 'admin',
          createdAt: bank.createdAt ?? new Date(),
          updatedAt: bank.updatedAt ?? new Date(),
        },
        $setOnInsert: {
          createdAt: bank.createdAt ?? new Date(),
        },
      },
      upsert: true,
    },
  }));

  const result = await PriTestBank.bulkWrite(ops, { ordered: false });
  console.log('[migrate-pri-test-banks] Migration complete:', result.result ?? result);

  await mongoose.disconnect();
}

migrate().catch((error) => {
  console.error('[migrate-pri-test-banks] Migration failed:', error);
  mongoose.disconnect().finally(() => process.exit(1));
});
