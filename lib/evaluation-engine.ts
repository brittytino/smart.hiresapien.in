import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import connectDB from './mongodb';
import PriTestResponse from '@/models/PriTestResponse';
import QuestionBank from '@/models/QuestionBank';

// Updated model pool — only models confirmed available on the free/standard Gemini API.
// gemini-2.0-flash and gemini-2.0-flash-lite are stable GA models.
// gemini-2.5-flash is kept first as the best option when available.
const GEMINI_MODEL_POOL = [
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
];

async function callGeminiWithRetry(genAI: GoogleGenerativeAI, prompt: string, maxRetries = 3): Promise<string> {
  let modelIndex = 0;
  let attempt = 0;

  while (true) {
    const currentModel = GEMINI_MODEL_POOL[modelIndex];
    try {
      const model = genAI.getGenerativeModel({ model: currentModel });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || '';
    } catch (error: any) {
      const status = error?.status;
      const message = error?.message || '';

      const is404 = status === 404 || message.includes('404') || message.includes('not found');
      const is503 = status === 503 || message.includes('503');
      const is429 = status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED');

      if (is404) {
        console.warn(`[AI Eval] Gemini ${currentModel} not found (404). Rotating model...`);
        modelIndex++;
        if (modelIndex >= GEMINI_MODEL_POOL.length) {
          throw new Error('All Gemini models in pool returned 404.');
        }
        continue;
      }

      if ((is503 || is429) && attempt < maxRetries) {
        attempt++;
        modelIndex = (modelIndex + 1) % GEMINI_MODEL_POOL.length;
        const delay = Math.min(Math.pow(2, attempt) * 800 + Math.floor(Math.random() * 400), 8000);
        console.warn(`[AI Eval] Gemini ${currentModel} (${status}). Rotating to ${GEMINI_MODEL_POOL[modelIndex]}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
}

async function callClaudeWithFallback(claude: Anthropic, prompt: string): Promise<string> {
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5';
  console.log(`[AI Eval] Falling back to Claude (${model})...`);
  const message = await claude.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = message.content[0];
  if (block.type === 'text') return block.text;
  return '';
}

async function callModelWithRetry(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  try {
    const text = await callGeminiWithRetry(genAI, prompt);
    if (text) return text;
  } catch (geminiError: any) {
    console.warn('[AI Eval] All Gemini models failed:', geminiError?.message || geminiError);
  }

  // Claude fallback
  const claudeKey = process.env.CLAUDE_API_KEY;
  if (!claudeKey) {
    throw new Error('All Gemini models failed and no CLAUDE_API_KEY configured.');
  }
  const claude = new Anthropic({ apiKey: claudeKey });
  return callClaudeWithFallback(claude, prompt);
}

export async function runAIEvaluation(testResponseId?: string) {
  try {
    await connectDB();

    let responses;
    if (testResponseId) {
      const resp = await PriTestResponse.findById(testResponseId).lean();
      responses = resp ? [resp] : [];
    } else {
      // Fetch latest 10 documents that have at least one written answer
      responses = await PriTestResponse.find({ 'answers.questionType': 'written' })
        .sort({ _id: -1 })
        .limit(10)
        .lean();
    }

    const evaluations: any[] = [];
    const questionCache: Record<string, any> = {};

    for (const testResponse of responses) {
      if (evaluations.length >= 10 && !testResponseId) break;

      const writtenAnswers = (testResponse as any).answers?.filter(
        (ans: any) => ans.questionType === 'written'
      ) || [];

      for (const answer of writtenAnswers) {
        if (evaluations.length >= 10 && !testResponseId) break;

        const textToEvaluate = answer.studentAnswer || answer.answerText;
        if (!textToEvaluate || textToEvaluate.trim().length === 0) {
          continue;
        }

        const bankId = (testResponse as any).questionBankId?.toString();
        if (!bankId) {
          evaluations.push({
            testResponseId: (testResponse as any)._id,
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
        if (!bankData || !(bankData as any).questions || typeof answer.questionIndex !== 'number') {
          continue;
        }

        const questionData = (bankData as any).questions[answer.questionIndex];
        if (!questionData) {
          evaluations.push({
            testResponseId: (testResponse as any)._id,
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
          resultText = await callModelWithRetry(prompt);
          resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

          if (!resultText) {
            evaluations.push({
              testResponseId: (testResponse as any)._id,
              questionIndex: answer.questionIndex,
              questionText: questionText,
              answerSubmitted: textToEvaluate,
              error: 'Model returned an empty response.'
            });
            continue;
          }

          const evaluation = JSON.parse(resultText);

          evaluations.push({
            testResponseId: (testResponse as any)._id,
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
            testResponseId: (testResponse as any)._id,
            questionIndex: answer.questionIndex,
            questionText: questionText,
            answerSubmitted: textToEvaluate,
            error: `Failed to evaluate. Reason: ${evalError instanceof Error ? evalError.message : String(evalError)}`,
            rawModelOutput: resultText || 'No output'
          });
        }
      }
    }

    return { success: true, results: evaluations };
  } catch (error: any) {
    console.error('Error in AI evaluation logic:', error);
    return { success: false, error: error.message || 'Internal Error' };
  }
}
