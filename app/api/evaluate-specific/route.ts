import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PriTestResponse from '@/models/PriTestResponse';
import QuestionBank from '@/models/QuestionBank';
import { checkRateLimit } from '@/lib/limiter';

function handleRateLimit(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, remaining, limit } = checkRateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString()
      }
    });
  }
  return null; // OK
}

export async function POST(req: Request) {
  const rl = handleRateLimit(req);
  if (rl) return rl;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const body = await req.json();
    const { testResponseId } = body;

    if (!testResponseId) {
      return NextResponse.json({ error: 'testResponseId is required.' }, { status: 400 });
    }

    await connectDB();

    const testResponse = await PriTestResponse.findById(testResponseId).lean();
    if (!testResponse) {
      return NextResponse.json({ error: 'Test response not found.' }, { status: 404 });
    }

    const writtenAnswers = testResponse.answers?.filter(
      (ans: any) => ans.questionType === 'written'
    ) || [];

    if (writtenAnswers.length === 0) {
      return NextResponse.json({ success: true, message: 'No written answers to evaluate.', results: [] });
    }

    const evaluations: any[] = [];
    const questionCache: Record<string, any> = {};

    for (const answer of writtenAnswers) {
      if (evaluations.length >= 2) break; // Limit to 2 per batch

      const textToEvaluate = answer.studentAnswer || answer.answerText;
      if (!textToEvaluate || textToEvaluate.trim().length === 0) {
        continue;
      }

      const bankId = testResponse.questionBankId?.toString();
      if (!bankId) {
        evaluations.push({
          testResponseId: testResponse._id,
          error: 'Database record missing questionBankId.',
          answerSubmitted: textToEvaluate
        });
        continue;
      }

      if (!questionCache[bankId]) {
        const bank = await QuestionBank.findById(bankId).lean();
        if (bank) {
          questionCache[bankId] = bank;
        }
      }

      const bankData = questionCache[bankId];
      if (!bankData || !bankData.questions || typeof answer.questionIndex !== 'number') {
        continue;
      }

      const questionData = bankData.questions[answer.questionIndex];
      if (!questionData) {
        evaluations.push({
          testResponseId: testResponse._id,
          error: `Question missing at index ${answer.questionIndex} in bank.`,
          answerSubmitted: textToEvaluate
        });
        continue;
      }

      const domain = questionData.domainId || 'Business Context';
      const questionText = questionData.questionText || '';

      const prompt = `You are a warm, experienced Corporate Communications Coach mentoring an MBA student in India for the domain: "${domain}".
The student has responded to the following workplace scenario:

Scenario Prompt: ${questionText}
Student's Response: ${textToEvaluate}

IMPORTANT RULES:
- Write ALL feedback in the second person, speaking directly to the student ("You did well...", "Your response...", "Consider improving...").
- Never use technical or meta language like "this appears to be a placeholder", "prompt", "the input seems invalid", "this is not a real response", or anything that sounds robotic or system-generated.
- If the response is gibberish, irrelevant, or nonsensical, give 0 for all scores and write a brief, kind, human message telling them that its gibberish.
- Always sound like a real human mentor, not an AI system.

Score the student on a scale of 0-100 for the following parameters:
1. task_completion (25%): How well the response addresses the prompt.
2. clarity_and_brevity (20%): How clear and concise the communication is.
3. logical_structure (20%): Logical flow and formatting.
4. professional_tone (15%): Appropriateness and assertiveness of tone.
5. critical_thinking (20%): Strategic thinking and anticipation of next steps.

Provide 2-3 sentences of warm, constructive feedback highlighting what the student did well and one key area to improve.

Output your evaluation as a strict, valid JSON object exactly matching this schema. Calculate the 'averageScore' as the weighted sum. Do not use Markdown backticks (no \`\`\`json). Just the raw object:
{
  "scores": {
    "task_completion": number,
    "clarity_and_brevity": number,
    "logical_structure": number,
    "professional_tone": number,
    "critical_thinking": number
  },
  "feedback": "string",
  "averageScore": number
}`;

      let resultText = '';
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        resultText = response.text() || '';
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        if (!resultText) {
          evaluations.push({
            testResponseId: testResponse._id,
            questionIndex: answer.questionIndex,
            questionText: questionText,
            answerSubmitted: textToEvaluate,
            error: 'Model returned an empty response. Likely due to safety filters or gibberish input.'
          });
          continue;
        }

        const evaluation = JSON.parse(resultText);

        evaluations.push({
          testResponseId: testResponse._id,
          questionIndex: answer.questionIndex,
          domain: domain,
          questionId: answer.questionId,
          questionText: questionText,
          answerSubmitted: textToEvaluate,
          evaluation: evaluation,
        });
      } catch (evalError) {
        console.error(`Failed to evaluate answer for question at index ${answer.questionIndex}`, evalError);
        evaluations.push({
          testResponseId: testResponse._id,
          questionIndex: answer.questionIndex,
          questionText: questionText,
          answerSubmitted: textToEvaluate,
          error: `Failed to evaluate. Reason: ${evalError instanceof Error ? evalError.message : String(evalError)}`,
          rawModelOutput: typeof resultText !== 'undefined' ? resultText : 'No output'
        });
      }
    }

    return NextResponse.json({ success: true, results: evaluations });
  } catch (error: any) {
    console.error('Error in specific evaluation:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
