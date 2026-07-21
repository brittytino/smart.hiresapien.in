#!/usr/bin/env node
/*
 Diagnostic helper: compare DB raw answers, evaluation document, and question bank
 Usage: MONGODB_URI="..." node scripts/diagnose-domain-mismatch.js <responseId> [domainId]
*/
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Please set MONGODB_URI environment variable.');
    process.exit(2);
  }
  const responseArg = process.argv[2];
  const domainFilter = process.argv[3];
  if (!responseArg) {
    console.error('Usage: node scripts/diagnose-domain-mismatch.js <responseId or responseCode> [domainId]');
    process.exit(2);
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;

  let responseDoc = null;
  try {
    // try by _id first
    responseDoc = await db.collection('students_pri_test_response').findOne({ _id: ObjectId.isValid(responseArg) ? new ObjectId(responseArg) : responseArg });
  } catch (err) {
    // ignored
  }
  if (!responseDoc) {
    // try by responseCode
    responseDoc = await db.collection('students_pri_test_response').findOne({ responseCode: responseArg });
  }
  if (!responseDoc) {
    console.error('Response not found for', responseArg);
    process.exit(3);
  }

  const evalDoc = await db.collection('pri_test_evaluations').findOne({ responseId: responseDoc._id });

  // Fetch bank (try pri_test_banks then question_banks)
  const bankId = responseDoc.questionBankId;
  let bankDoc = null;
  if (bankId) {
    bankDoc = await db.collection('pri_test_banks').findOne({ _id: ObjectId.isValid(bankId) ? new ObjectId(bankId) : bankId });
    if (!bankDoc) {
      bankDoc = await db.collection('question_banks').findOne({ _id: ObjectId.isValid(bankId) ? new ObjectId(bankId) : bankId });
    }
  }

  console.log('=== RESPONSE ===');
  console.log('id:', responseDoc._id.toString());
  console.log('studentName:', responseDoc.studentName);
  console.log('questionBankId:', responseDoc.questionBankId);
  console.log('answers count:', Array.isArray(responseDoc.answers) ? responseDoc.answers.length : 0);

  console.log('\n=== EVALUATION (stored) ===');
  if (evalDoc) {
    console.log('id:', evalDoc._id.toString());
    console.log('percentage:', evalDoc.percentage, 'totalScore:', evalDoc.totalScore);
  } else {
    console.log('No evaluation document found for this response.');
  }

  if (!bankDoc) {
    console.warn('\nWarning: question bank not found in pri_test_banks or question_banks for id', bankId);
  } else {
    console.log('\n=== QUESTION BANK ===');
    console.log('title:', bankDoc.title || bankDoc.bankTitle || 'N/A');
    const questions = bankDoc.questions || [];
    // filter domain
    const domainId = domainFilter;
    const domainQuestions = domainId ? questions.filter(q => q.domainId === domainId) : questions;
    console.log('questions in domain (or total):', domainQuestions.length);

    // Build subskill tallies from bank keyed by questionIndex in bank
    const subskillTotals = {};
    // Questions are assumed ordered; their index in bank.questions is the questionIndex used in response
    domainQuestions.forEach((q, idx) => {
      // Need to find global index in bank.questions
      const globalIndex = questions.indexOf(q);
      const key = `${q.domainId}::${q.subSkill || ''}`;
      subskillTotals[key] = subskillTotals[key] || { name: q.subSkill || '', total: 0, correct: 0, answered: 0, questionIndices: [] };
      subskillTotals[key].total += 1;
      subskillTotals[key].questionIndices.push(globalIndex);
    });

    // Walk student's answers and evaluate correctness per question
    for (const ans of responseDoc.answers || []) {
      if (!ans || typeof ans.questionIndex !== 'number') continue;
      const q = questions[ans.questionIndex];
      if (!q) continue;
      if (domainFilter && q.domainId !== domainFilter) continue;
      const key = `${q.domainId}::${q.subSkill || ''}`;
      const entry = subskillTotals[key] || (subskillTotals[key] = { name: q.subSkill || '', total: 0, correct: 0, answered: 0, questionIndices: [ans.questionIndex] });
      entry.answered += ans.selectedOption || ans.answerText ? 1 : 0;
      // determine correctness
      let isCorrect = false;
      if (typeof ans.isCorrect === 'boolean') isCorrect = ans.isCorrect;
      else if (ans.selectedOption && (ans.correctAnswer || q.correctAnswer)) {
        isCorrect = String(ans.selectedOption).trim() === String(ans.correctAnswer || q.correctAnswer).trim();
      }
      if (isCorrect) entry.correct += 1;
    }

    console.log('\n=== RAW COUNTS (by subskill) ===');
    for (const [k, v] of Object.entries(subskillTotals)) {
      console.log(`- ${k} -> total:${v.total} answered:${v.answered} correct:${v.correct}`);
    }

    if (evalDoc && Array.isArray(evalDoc.domains)) {
      console.log('\n=== STORED EVALUATION DOMAINS ===');
      const matched = evalDoc.domains.filter(d => !domainFilter || d.domainId === domainFilter);
      for (const d of matched) {
        console.log(`- domain ${d.domainName} (${d.domainId}) score:${d.score} correct:${d.correct} total:${d.total}`);
        for (const s of d.subskills || []) {
          console.log(`  - subskill ${s.name} -> score:${s.score} correct:${s.correct} total:${s.total}`);
        }
      }
    }

    // Compare sums
    if (evalDoc && Array.isArray(evalDoc.domains)) {
      const targetDomains = domainFilter ? evalDoc.domains.filter(d => d.domainId === domainFilter) : evalDoc.domains;
      for (const d of targetDomains) {
        const sumCorrect = (d.subskills || []).reduce((acc, s) => acc + (s.correct || 0), 0);
        const sumTotal = (d.subskills || []).reduce((acc, s) => acc + (s.total || 0), 0);
        if (sumCorrect !== d.correct || sumTotal !== d.total) {
          console.warn('\nDISCREPANCY for domain', d.domainId, d.domainName);
          console.warn('  stored domain correct/total:', d.correct, '/', d.total);
          console.warn('  sum of subskills correct/total:', sumCorrect, '/', sumTotal);
        } else {
          console.log('\nDomain sums match for', d.domainId);
        }
      }
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
