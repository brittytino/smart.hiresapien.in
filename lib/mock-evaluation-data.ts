import { DOMAINS, DomainId } from './domains';

export interface QuestionResponse {
  questionId: string;
  isCorrect: boolean;
  selectedOption: string;
  correctOption: string;
  questionText: string;
  subSkill: string;
}

export interface SubskillStat {
  name: string;
  attempted: number;
  correct: number;
  total: number;
  score: number;
}

export interface DomainStat {
  domainId: DomainId;
  domainName: string;
  attempted: number;
  total: number;
  score: number;
  subskills: SubskillStat[];
}

export interface StudentEvaluationResult {
  studentId: string;
  studentName: string;
  email: string;
  overallPRI: number;
  prizePill: 'Diamond' | 'Gold' | 'Silver' | 'None';
  domains: DomainStat[];
  responses: QuestionResponse[];
  status?: 'completed' | 'pending';
  testAttempted?: number;
  overallStatus?: 'pass' | 'fail' | 'pending';
  traitResults?: Record<string, {
    score: number;
    maxScore: number;
    passed: boolean;
  }>;
  responseId?: string;
  isResultsPublished?: boolean;
  mcqPriScore?: number;
  writtenPriScore?: number;
  psychometricPriScore?: number;
  priGatewayPassed?: boolean;
}


export function generateMockEvaluationData(testId: string): StudentEvaluationResult[] {
  const students = [
    { id: 'ST001', name: 'Arjun Mehta', email: 'arjun.mehta@university.edu' },
    { id: 'ST002', name: 'Priya Sharma', email: 'priya.s@university.edu' },
    { id: 'ST003', name: 'Rohan Gupta', email: 'rohan.g@grad360.com' },
    { id: 'ST004', name: 'Ananya Iyer', email: 'ananya.i@mba.edu' },
    { id: 'ST005', name: 'Vikram Singh', email: 'vikram.v@university.edu' },
  ];

  return students.map((student) => {
    let totalDomainScores = 0;
    let domainsCount = 0;

    // Filter out workspace-psychology from MCQ evaluation mock data
    const domainStats: DomainStat[] = DOMAINS
      .filter(domain => domain.id !== 'workspace-psychology')
      .slice(0, 6).map((domain) => {
      const subskillsList = Array.from(new Set(domain.skills.map(s => s.split(' - ')[0].trim())));
      
      let totalSubdomainScores = 0;
      let attemptedInDomain = 0;
      let totalInDomain = 0;

      const subskills: SubskillStat[] = subskillsList.map((subName) => {
        const total = 5; // Assume 5 questions per subskill for mock
        const attempted = Math.floor(Math.random() * (total + 1));
        const correct = Math.floor(Math.random() * (attempted + 1));
        const score = total > 0 ? (correct / total) * 100 : 0;
        
        attemptedInDomain += attempted;
        totalInDomain += total;
        totalSubdomainScores += score;

        return {
          name: subName,
          attempted,
          correct,
          total,
          score,
        };
      });

      const domainScore = totalSubdomainScores / subskills.length;
      totalDomainScores += domainScore;
      domainsCount++;

      return {
        domainId: domain.id,
        domainName: domain.name,
        attempted: attemptedInDomain,
        total: totalInDomain,
        score: domainScore,
        subskills,
      };
    });

    const overallPRI = totalDomainScores / domainsCount;
    
    // Determine Prize Pill based on PRI percentage
    let prizePill: StudentEvaluationResult['prizePill'] = 'None';

    if (overallPRI >= 90) { prizePill = 'Diamond'; }
    else if (overallPRI >= 80) { prizePill = 'Gold'; }
    else if (overallPRI >= 70) { prizePill = 'Silver'; }
    else { prizePill = 'None'; }

    // Filter out workspace-psychology from domain results
    const filteredDomains = domainStats.filter(d => d.domainId !== 'workspace-psychology');

    return {
      studentId: student.id,
      studentName: student.name,
      email: student.email,
      overallPRI: Math.trunc(overallPRI * 10) / 10,
      prizePill,
      domains: filteredDomains,
      responses: [], // Will populate if needed for detail view
    };
  }).sort((a, b) => b.overallPRI - a.overallPRI);
}
/**
 * Maps real API database evaluation results to the StudentEvaluationResult interface
 * used by the frontend components.
 */
export function mapApiToEvaluationResult(apiData: any[]): StudentEvaluationResult[] {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((item: any) => {
    const student = item.studentUserId || {};
    const mcqPriScore = Number(item.mcqPriScore || 0);
    const writtenPriScore = Number(item.writtenPriScore || 0);
    const storedPercentage = Number(item.percentage || 0);
    const fallbackPercentage = Math.min(100, Math.max(0, mcqPriScore + writtenPriScore));
    const effectivePercentage = storedPercentage > 0 ? storedPercentage : fallbackPercentage;
    const truncatedEffective = Math.trunc(effectivePercentage * 10) / 10;
    const overallPRI = mcqPriScore > 0
      ? Math.max(1, truncatedEffective)
      : truncatedEffective;

    // Determine Prize Pill based on PRI percentage
    let prizePill: StudentEvaluationResult['prizePill'] = 'None';

    if (overallPRI >= 90) { prizePill = 'Diamond'; }
    else if (overallPRI >= 80) { prizePill = 'Gold'; }
    else if (overallPRI >= 70) { prizePill = 'Silver'; }
    else { prizePill = 'None'; }

    // Filter out workspace-psychology from API response domains
    const domains: DomainStat[] = (item.domains || [])
      .filter((d: any) => d.domainId !== 'workspace-psychology')
      .map((d: any) => ({
      domainId: d.domainId as any,
      domainName: d.domainName,
      attempted: d.attempted || 0,
      total: d.total || 0,
      score: d.score || 0,
      subskills: (d.subskills || []).map((s: any) => ({
        name: s.name,
        attempted: s.attempted || 0,
        correct: s.correct || 0,
        total: s.total || 0,
        score: s.score || 0,
      })),
    }));

    return {
      studentId: student.studentId || student.username || 'N/A',
      studentName: student.fullName || 'Anonymous student',
      email: student.username || 'no-email@grad360.com',
      overallPRI,
      prizePill,
      domains,
      status: item.status || 'completed',
      testAttempted: item.testAttempted || 0,
      overallStatus: item.overallStatus || 'pending',
      traitResults: item.traitResults || {},
      responseId: item.responseId ? item.responseId.toString() : undefined,
      isResultsPublished: item.isResultsPublished || false,
      mcqPriScore,
      writtenPriScore,
      psychometricPriScore: item.psychometricPriScore || 0,
      priGatewayPassed: item.priGatewayPassed ?? true,
      responses: [],
    };
  }).sort((a, b) => b.overallPRI - a.overallPRI);
}
