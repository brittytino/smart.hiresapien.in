import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SmartCandidateResponse from '@/models/SmartCandidateResponse';
import { SMART_QUESTIONS } from '@/lib/smart-questions';

const DOMAIN_WEIGHTS: Record<string, number> = {
  'computational-thinking': 0.10,
  'programming-fundamentals': 0.15,
  'frontend-engineering': 0.15,
  'backend-engineering': 0.15,
  'database-engineering': 0.10,
  'debugging-quality': 0.10,
  'system-design': 0.15,
  'ai-augmented': 0.10,
};

const DOMAIN_BENCHMARKS: Record<string, number> = {
  'computational-thinking': 72,
  'programming-fundamentals': 78,
  'frontend-engineering': 70,
  'backend-engineering': 65,
  'database-engineering': 60,
  'debugging-quality': 68,
  'system-design': 55,
  'ai-augmented': 62,
};

const DIFFICULTY_POINTS: Record<string, number> = {
  'easy': 50,
  'medium': 100,
  'hard': 150,
};

const DOMAIN_NAMES: Record<string, string> = {
  'computational-thinking': 'Computational Thinking',
  'programming-fundamentals': 'Programming Fundamentals',
  'frontend-engineering': 'Frontend Engineering',
  'backend-engineering': 'Backend Engineering',
  'database-engineering': 'Database Engineering',
  'debugging-quality': 'Debugging & Quality Engineering',
  'system-design': 'System Design & Architecture',
  'ai-augmented': 'AI-Augmented Engineering',
};

const RECOMMENDATIONS: Record<string, string> = {
  'computational-thinking': 'Strengthen problem decomposition and practice parsing algorithm efficiency (Big-O notation) with recursive tree analysis.',
  'programming-fundamentals': 'Review object-oriented design compliance (specifically Liskov Substitution and Open-Closed principles) and volatile variables in thread safety.',
  'frontend-engineering': 'Focus on Layout Instability metrics (Cumulative Layout Shift) and how layout boundaries prevent reflow loops.',
  'backend-engineering': 'Practice writing state-window rate-limit structures, CORS access validation, and JWT payload verify hooks.',
  'database-engineering': 'Study SQL-92 transaction levels, read anomalies (phantom reads), and compound index order guidelines.',
  'debugging-quality': 'Inspect boundary values in loop conditions and diagnostic stack traces to prevent index out of range issues.',
  'system-design': 'Deep dive into load balancer failover structures and high-availability database failover topologies.',
  'ai-augmented': 'Implement secure prompt grounding techniques and runtime validation gates on LLM generated code blocks.',
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, answers: submittedAnswers } = body; // answers: Array of { questionId, studentAnswer, timeSpentSeconds }

    if (!id || !submittedAnswers || !Array.isArray(submittedAnswers)) {
      return NextResponse.json({ error: 'Session ID and answers array are required.' }, { status: 400 });
    }

    const candidateSession = await SmartCandidateResponse.findById(id);
    if (!candidateSession) {
      return NextResponse.json({ error: 'Assessment session not found.' }, { status: 404 });
    }

    if (candidateSession.status === 'submitted') {
      return NextResponse.json({ error: 'Assessment already submitted.' }, { status: 400 });
    }

    const gradedAnswers: any[] = [];
    const domainPointsEarned: Record<string, number> = {};
    const domainPointsPossible: Record<string, number> = {};

    // Initialize scoring trackers
    Object.keys(DOMAIN_WEIGHTS).forEach((domain) => {
      domainPointsEarned[domain] = 0;
      domainPointsPossible[domain] = 0;
    });

    for (const sub of submittedAnswers) {
      const q = SMART_QUESTIONS.find((item) => item.id === sub.questionId);
      if (!q) continue;

      let isCorrect = false;
      const studentAns = sub.studentAnswer;
      const correctAns = q.correctAnswer;
      const points = DIFFICULTY_POINTS[q.difficulty] || 100;

      if (q.questionType === 'mcq') {
        isCorrect = String(studentAns).trim().toLowerCase() === String(correctAns).trim().toLowerCase();
      } else if (q.questionType === 'maq') {
        if (Array.isArray(studentAns) && Array.isArray(correctAns)) {
          const sSet = new Set(studentAns.map(v => String(v).trim().toLowerCase()));
          const cSet = new Set(correctAns.map(v => String(v).trim().toLowerCase()));
          isCorrect = sSet.size === cSet.size && [...sSet].every((val) => cSet.has(val));
        }
      } else if (q.questionType === 'touchboard') {
        // studentAns: { x: number, y: number }
        if (studentAns && typeof studentAns.x === 'number' && typeof studentAns.y === 'number') {
          const { x, y } = studentAns;
          const { xMin, xMax, yMin, yMax } = correctAns;
          isCorrect = x >= xMin && x <= xMax && y >= yMin && y <= yMax;
        }
      } else if (q.questionType === 'oral') {
        // studentAns: string (speech-to-text transcript)
        const transcript = String(studentAns || '').toLowerCase();
        if (Array.isArray(correctAns)) {
          // Count matched keywords
          const matches = correctAns.filter((keyword) => transcript.includes(keyword.toLowerCase()));
          isCorrect = matches.length >= 2; // Pass threshold: at least 2 keywords mentioned
        }
      }

      gradedAnswers.push({
        domainId: q.domainId,
        questionId: q.id,
        questionType: q.questionType,
        difficulty: q.difficulty,
        questionText: q.questionText,
        studentAnswer: studentAns,
        isCorrect,
        timeSpentSeconds: Number(sub.timeSpentSeconds || 0),
      });

      // Accumulate points
      domainPointsPossible[q.domainId] += points;
      if (isCorrect) {
        domainPointsEarned[q.domainId] += points;
      }
    }

    // Compute competency percentages (0-100%)
    const competencyScores = new Map<string, number>();
    let overallWeightedPercent = 0;
    let totalWeightUsed = 0;

    Object.keys(DOMAIN_WEIGHTS).forEach((domain) => {
      const earned = domainPointsEarned[domain];
      const possible = domainPointsPossible[domain];
      
      // Default to 50% if no questions served to avoid division by zero (though CAT guarantees 2 per domain)
      const percent = possible > 0 ? Math.round((earned / possible) * 100) : 50;
      competencyScores.set(domain, percent);

      const weight = DOMAIN_WEIGHTS[domain];
      overallWeightedPercent += percent * weight;
      totalWeightUsed += weight;
    });

    const smartScore = Math.round(overallWeightedPercent * 10); // Scaled out of 1000

    // Benchmark Percentile calculation
    const benchmarkPercentile = Math.min(98, Math.max(10, Math.round(12 + (smartScore / 1000) * 86)));

    // Readiness Level
    let readinessLevel = 'Needs Training / Developing';
    if (smartScore >= 800) {
      readinessLevel = 'Production Ready (Senior SDE)';
    } else if (smartScore >= 600) {
      readinessLevel = 'Deployment Ready (Mid SDE)';
    } else if (smartScore >= 400) {
      readinessLevel = 'Core Competent (Junior SDE)';
    }

    // Learning Recommendations based on low domains (score < 70)
    const learningRecommendations: string[] = [];
    let lowestDomains: Array<{ domain: string; score: number }> = [];
    
    competencyScores.forEach((score, domain) => {
      lowestDomains.push({ domain, score });
    });
    lowestDomains.sort((a, b) => a.score - b.score);

    // Take top 3 weakest domains
    lowestDomains.slice(0, 3).forEach((item) => {
      const rec = RECOMMENDATIONS[item.domain];
      if (rec) {
        learningRecommendations.push(`[${DOMAIN_NAMES[item.domain]}] ${rec}`);
      }
    });

    // Skill Gap Analysis
    const skillGapAnalysis = Object.keys(DOMAIN_WEIGHTS).map((domain) => {
      return {
        domain: DOMAIN_NAMES[domain],
        score: competencyScores.get(domain) || 0,
        benchmark: DOMAIN_BENCHMARKS[domain],
      };
    });

    // Update database session
    candidateSession.status = 'submitted';
    candidateSession.answers = gradedAnswers;
    candidateSession.smartScore = smartScore;
    candidateSession.competencyScores = competencyScores;
    candidateSession.benchmarkPercentile = benchmarkPercentile;
    candidateSession.readinessLevel = readinessLevel;
    candidateSession.learningRecommendations = learningRecommendations;
    candidateSession.skillGapAnalysis = skillGapAnalysis;
    candidateSession.submittedAt = new Date();
    
    const totalDuration = Math.round(
      (candidateSession.submittedAt.getTime() - candidateSession.startedAt.getTime()) / 1000
    );
    candidateSession.totalDurationSeconds = totalDuration;

    await candidateSession.save();

    return NextResponse.json({
      success: true,
      smartScore,
      benchmarkPercentile,
      readinessLevel,
      competencyScores: Object.fromEntries(competencyScores),
      skillGapAnalysis,
      learningRecommendations,
      totalDurationSeconds: totalDuration,
      message: 'Assessment evaluated and saved successfully.',
    });
  } catch (error: any) {
    console.error('[SMART API Submit] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit assessment.' }, { status: 500 });
  }
}
