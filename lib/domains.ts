export type DomainId =
  | 'computational-thinking'
  | 'programming-fundamentals'
  | 'frontend-engineering'
  | 'backend-engineering'
  | 'database-engineering'
  | 'debugging-quality'
  | 'system-design'
  | 'ai-augmented';

export interface Domain {
  id: DomainId;
  number: string;
  name: string;
  description: string;
  assessmentType: string;
  totalQuestions: number;
  skills: string[];
  /** Whether this domain has a pass/fail outcome instead of a scored PRI */
  passFail: boolean;
  color: string; // Tailwind color class prefix for UI
}

export const DOMAINS: Domain[] = [
  {
    id: 'computational-thinking',
    number: 'D1',
    name: 'Computational Thinking',
    description: 'Logical reasoning, problem decomposition, pattern recognition, and algorithm efficiency',
    assessmentType: 'Adaptive MCQ',
    totalQuestions: 10,
    skills: [
      'Logical reasoning',
      'Problem decomposition',
      'Pattern recognition',
      'Algorithm selection',
      'Computational efficiency'
    ],
    passFail: false,
    color: 'blue'
  },
  {
    id: 'programming-fundamentals',
    number: 'D2',
    name: 'Programming Fundamentals',
    description: 'Language fundamentals, variables, data structures, OOP, functions, and error handling',
    assessmentType: 'Adaptive MCQ',
    totalQuestions: 15,
    skills: [
      'Variables and Scope',
      'Core Data Structures',
      'Functions and Closures',
      'OOP Principles',
      'Error Handling',
      'Language fundamentals'
    ],
    passFail: false,
    color: 'emerald'
  },
  {
    id: 'frontend-engineering',
    number: 'D3',
    name: 'Frontend Engineering',
    description: 'HTML, CSS, JS, React fundamentals, component design, responsive UI, and accessibility',
    assessmentType: 'Adaptive MCQ',
    totalQuestions: 15,
    skills: [
      'HTML Semantics',
      'CSS Layouts & Responsive UI',
      'JavaScript Core',
      'React Fundamentals',
      'Component Architecture',
      'Web Accessibility (a11y)'
    ],
    passFail: false,
    color: 'indigo'
  },
  {
    id: 'backend-engineering',
    number: 'D4',
    name: 'Backend Engineering',
    description: 'REST APIs, Authentication, Authorization, Middleware, Business Logic, and Server Architecture',
    assessmentType: 'Adaptive MCQ',
    totalQuestions: 15,
    skills: [
      'REST APIs design',
      'Authentication mechanics',
      'Authorization models',
      'Business logic validation',
      'Middleware layers',
      'Server architecture & scaling',
      'Backend Error handling'
    ],
    passFail: false,
    color: 'purple'
  },
  {
    id: 'database-engineering',
    number: 'D5',
    name: 'Database Engineering',
    description: 'SQL & NoSQL, schema design, relationships, query optimization, and transactions',
    assessmentType: 'Adaptive MCQ',
    totalQuestions: 10,
    skills: [
      'SQL Queries',
      'NoSQL Storage',
      'Schema design & normalization',
      'Database Relationships',
      'Query optimization',
      'Transactions & ACID'
    ],
    passFail: false,
    color: 'amber'
  },
  {
    id: 'debugging-quality',
    number: 'D6',
    name: 'Debugging & Quality Engineering',
    description: 'Bug identification, root cause analysis, code tracing, testing concepts, and logs',
    assessmentType: 'Adaptive MCQ',
    totalQuestions: 10,
    skills: [
      'Bug identification',
      'Root cause analysis',
      'Code tracing & execution flow',
      'Testing concepts & frameworks',
      'Log analysis & diagnostic telemetry'
    ],
    passFail: false,
    color: 'rose'
  },
  {
    id: 'system-design',
    number: 'D7',
    name: 'System Design & Architecture',
    description: 'Scalability, microservices, caching, load balancing, security, and design trade-offs',
    assessmentType: 'Adaptive MCQ',
    totalQuestions: 15,
    skills: [
      'System Scalability',
      'Architecture patterns',
      'Microservices orchestration',
      'Caching strategies',
      'Load balancing',
      'System Security & Encryption',
      'Design trade-offs'
    ],
    passFail: false,
    color: 'violet'
  },
  {
    id: 'ai-augmented',
    number: 'D8',
    name: 'AI-Augmented Engineering',
    description: 'Prompt engineering, AI-assisted coding, code verification, secure AI usage, and debugging',
    assessmentType: 'Adaptive MCQ',
    totalQuestions: 10,
    skills: [
      'Prompt engineering design',
      'AI-assisted coding flow',
      'AI output verification',
      'Secure AI usage & compliance',
      'AI debugging',
      'Responsible AI practices'
    ],
    passFail: false,
    color: 'cyan'
  }
];

export const DOMAIN_MAP = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d])
) as Record<DomainId, Domain>;

/** Assessment types that require a case/scenario context block */
export const CASE_BASED_TYPES = new Set([
  'Case-based MCQ',
  'Case Simulation + MCQ',
  'Situational Judgment Test',
]);

/** Assessment types that do NOT have a single "correct" answer */
export const NO_CORRECT_ANSWER_TYPES = new Set(['Ipsative Psychometric']);
