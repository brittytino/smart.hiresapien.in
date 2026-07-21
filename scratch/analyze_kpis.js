import mongoose from 'mongoose';
import connectDB from './lib/mongodb.js';
import PriTestEvaluation from './models/PriTestEvaluation.js';
import UserAccount from './models/UserAccount.js';

async function analyze() {
  await connectDB();
  
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  // Current Month Avg
  const currentMonthStats = await PriTestEvaluation.aggregate([
    { $match: { evaluatedAt: { $gte: currentMonthStart } } },
    { $group: { _id: null, avg: { $sum: '$percentage' }, count: { $sum: 1 } } }
  ]);
  
  // Last Month Avg
  const lastMonthStats = await PriTestEvaluation.aggregate([
    { $match: { evaluatedAt: { $gte: lastMonthStart, $lt: currentMonthStart } } },
    { $group: { _id: null, avg: { $sum: '$percentage' }, count: { $sum: 1 } } }
  ]);
  
  console.log('Current Month:', currentMonthStats);
  console.log('Last Month:', lastMonthStats);
  
  // Participation
  const uniqueStudentsTested = await PriTestEvaluation.distinct('studentUserId');
  console.log('Unique Students Tested:', uniqueStudentsTested.length);
  
  const totalStudents = await UserAccount.countDocuments({ role: 'student' });
  console.log('Total Students:', totalStudents);

  process.exit(0);
}

analyze();
