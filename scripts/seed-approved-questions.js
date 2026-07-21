const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://thiganthworkspace_db_user:vaKhdslgcYN91EgN@cluster0.qbsoiup.mongodb.net/test?retryWrites=true&w=majority";

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    const domain = 'business-intelligence';
    const subSkills = [
        'Financial Statement Interpretation - Profit and loss statement',
        'Market Analysis - Porter\'s Five Forces'
    ];

    console.log(`Seeding 4 approved questions for domain: ${domain}...`);

    const questions = [
        {
            uniqueId: `seed_bi_1_${Date.now()}`,
            domain: domain,
            subSkill: subSkills[0],
            assessmentType: 'Case-based MCQ',
            questionType: 'mcq',
            questionText: 'Given the case data, what is the Gross Profit Margin for Year 2?',
            difficulty: 'easy',
            estimatedTimeMinutes: 2,
            options: [
                { label: 'A', text: '15%' },
                { label: 'B', text: '25%' },
                { label: 'C', text: '35%' },
                { label: 'D', text: '45%' }
            ],
            correctAnswer: 'B',
            status: 'approved',
            contributorUsername: 'seed_bot',
            contributorId: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            uniqueId: `seed_bi_2_${Date.now()}`,
            domain: domain,
            subSkill: subSkills[0],
            assessmentType: 'Case-based MCQ',
            questionType: 'mcq',
            questionText: 'Which item in the balance sheet reflects the long-term debt of the company?',
            difficulty: 'medium',
            estimatedTimeMinutes: 2,
            options: [
                { label: 'A', text: 'Accounts Payable' },
                { label: 'B', text: 'Long-term Liabilities' },
                { label: 'C', text: 'Retained Earnings' },
                { label: 'D', text: 'Goodwill' }
            ],
            correctAnswer: 'B',
            status: 'approved',
            contributorUsername: 'seed_bot',
            contributorId: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            uniqueId: `seed_bi_3_${Date.now()}`,
            domain: domain,
            subSkill: subSkills[1],
            assessmentType: 'Case-based MCQ',
            questionType: 'mcq',
            questionText: 'According to Porter\'s Five Forces, which of these increases the threat of new entrants?',
            difficulty: 'easy',
            estimatedTimeMinutes: 2,
            options: [
                { label: 'A', text: 'High capital requirements' },
                { label: 'B', text: 'Strong brand loyalty' },
                { label: 'C', text: 'Low switching costs' },
                { label: 'D', text: 'Patented technology' }
            ],
            correctAnswer: 'C',
            status: 'approved',
            contributorUsername: 'seed_bot',
            contributorId: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            uniqueId: `seed_bi_4_${Date.now()}`,
            domain: domain,
            subSkill: subSkills[1],
            assessmentType: 'Case-based MCQ',
            questionType: 'mcq',
            questionText: 'When suppliers are highly concentrated, what happens to their bargaining power?',
            difficulty: 'medium',
            estimatedTimeMinutes: 2,
            options: [
                { label: 'A', text: 'It decreases' },
                { label: 'B', text: 'It increases' },
                { label: 'C', text: 'It remains the same' },
                { label: 'D', text: 'It depends on the buyer size' }
            ],
            correctAnswer: 'B',
            status: 'approved',
            contributorUsername: 'seed_bot',
            contributorId: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // Use regular mongo driver to ensure we hit the right collection name 'questions'
    const result = await db.collection('questions').insertMany(questions);
    console.log(`Successfully inserted ${result.insertedCount} questions.`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
