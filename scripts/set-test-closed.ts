import connectDB from '../lib/mongodb';
import UserAccount from '../models/UserAccount';
import PriTestResponse from '../models/PriTestResponse';
import mongoose from 'mongoose';

async function check() {
  await connectDB();
  const student = await UserAccount.findOne({ username: 'test_student' });
  if (!student) {
    console.log('Student not found');
    process.exit(1);
  }
  console.log('Student ID:', student._id);

  // Find or create a PriTest
  let priTest = await mongoose.model('PriTest', new mongoose.Schema({
    testTitle: String,
    status: String,
    assignedInstitutions: [mongoose.Schema.Types.ObjectId]
  }, { collection: 'pri_tests' })).findOne({});
  
  if (!priTest) {
    console.log('Creating dummy PriTest...');
    const PriTestModel = mongoose.model('PriTest');
    priTest = await PriTestModel.create({
      testTitle: 'Verification Test',
      status: 'published',
      assignedInstitutions: [student.institutionId]
    });
  }
  
  if (!priTest) {
    throw new Error('Failed to create or find PriTest');
  }

  console.log('PriTest ID:', priTest._id);

  // Create or update response with 'closed' status
  const response = await PriTestResponse.findOneAndUpdate(
    { studentUserId: student._id, priTestId: priTest._id },
    { 
      status: 'closed', 
      updatedAt: new Date(),
      totalQuestions: 1,
      correctAnswers: 0,
      score: 0,
      percentage: 0,
      domainScores: []
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log('Response status set to:', response.status);
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
