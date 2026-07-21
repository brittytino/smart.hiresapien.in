import mongoose from 'mongoose';
import connectDB from './lib/mongodb.js';
import Batch from './models/Batch.js';
import UserAccount from './models/UserAccount.js';

async function test() {
  try {
    await connectDB();
    console.log('Connected to DB');

    const batches = await Batch.find().limit(5).lean();
    console.log('Sample Batches:', JSON.stringify(batches, null, 2));

    const studentsWithBatch = await UserAccount.find({ 
      role: 'student', 
      batch: { $exists: true, $ne: '' } 
    }).limit(5).lean();
    console.log('Sample Students with batch:', JSON.stringify(studentsWithBatch.map(s => ({ username: s.username, batch: s.batch })), null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
