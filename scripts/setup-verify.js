const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://thiganthworkspace_db_user:vaKhdslgcYN91EgN@cluster0.qbsoiup.mongodb.net/";

async function setup() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    // 1. Find the test student
    const student = await db.collection('users').findOne({ username: 'test_student' });
    if (!student) {
      console.error('Student not found');
      process.exit(1);
    }
    console.log('Student ID:', student._id);

    // 2. Find any PRI Test Bank assigned to this institution
    const bank = await db.collection('pri_test_banks').findOne({
      'institutions.institutionId': student.institutionId
    });

    if (!bank) {
      console.warn('No PRI Test Bank found for institution. Creating a dummy one...');
      // We need a dummy bank to even get to the "Already Submitted" check in the API
      const dummyBankId = new mongoose.Types.ObjectId();
      await db.collection('pri_test_banks').insertOne({
        _id: dummyBankId,
        title: 'Verification Bank',
        status: 'published',
        institutions: [
          {
            institutionId: student.institutionId,
            status: 'accepted',
            examStartDate: new Date(Date.now() - 3600000), // 1 hour ago
            examEndDate: new Date(Date.now() + 3600000),  // 1 hour from now
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created dummy bank:', dummyBankId);
      
      // Now set the response for this dummy bank
      await db.collection('students_pri_test_response').updateOne(
        { studentUserId: student._id, questionBankId: dummyBankId },
        {
          $set: {
            status: 'closed', // This is what we want to test
            institutionId: student.institutionId,
            questionBankId: dummyBankId,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    } else {
      console.log('Found existing bank:', bank._id);
      await db.collection('students_pri_test_response').updateOne(
        { studentUserId: student._id, questionBankId: bank._id },
        {
          $set: {
            status: 'closed',
            institutionId: student.institutionId,
            questionBankId: bank._id,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    console.log('Successfully set student test response to "closed"');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setup();
