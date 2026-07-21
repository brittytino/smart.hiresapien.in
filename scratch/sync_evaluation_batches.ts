import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';
import PriTestEvaluation from '../models/PriTestEvaluation';
import PriTestResponse from '../models/PriTestResponse';

async function syncBatches() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected.');

    const evaluations = await PriTestEvaluation.find({ batch: { $exists: false } });
    console.log(`Found ${evaluations.length} evaluations without a batch.`);

    let updatedCount = 0;
    for (const evalDoc of evaluations) {
      const response = await PriTestResponse.findById(evalDoc.responseId).select('batch').lean();
      if (response && response.batch) {
        await PriTestEvaluation.updateOne(
          { _id: evalDoc._id },
          { $set: { batch: response.batch } }
        );
        updatedCount++;
        if (updatedCount % 10 === 0) {
          console.log(`Updated ${updatedCount} records...`);
        }
      } else {
        console.warn(`Could not find response or batch for evaluation ${evalDoc._id}`);
      }
    }

    console.log(`Finished. Successfully updated ${updatedCount} records.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

syncBatches();
