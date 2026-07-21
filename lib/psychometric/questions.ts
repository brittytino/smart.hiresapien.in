export interface Option {
  id: string;
  text: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Trait {
  id: string;
  title: string;
  questions: Question[];
}

export const testData: Trait[] = [
  {
    id: 'trait-1',
    title: 'Stress Resilience & Pressure Management',
    questions: [
      {
        id: 'q1',
        text: 'A critical deadline is suddenly moved up while you are already handling multiple tasks. What do you naturally do first?',
        options: [
          { id: 'q1-a', text: 'Pause work because the situation feels overwhelming', score: -1 },
          { id: 'q1-b', text: 'Start working but jump between tasks without clear order', score: -0.5 },
          { id: 'q1-c', text: 'Try to list tasks but struggle to decide priority', score: 0 },
          { id: 'q1-d', text: 'Reorganise tasks based on urgency and impact', score: 1 },
        ],
      },
      {
        id: 'q2',
        text: 'You receive strong critical feedback on something you worked hard on. How do you typically respond internally?',
        options: [
          { id: 'q2-a', text: 'Feel demotivated and avoid similar tasks', score: -1 },
          { id: 'q2-b', text: 'Start doubting your ability', score: -0.5 },
          { id: 'q2-c', text: 'Accept it but take time to regain confidence', score: 0 },
          { id: 'q2-d', text: 'Extract key improvements and apply them quickly', score: 1 },
        ],
      },
      {
        id: 'q3',
        text: 'Multiple stakeholders assign urgent tasks at the same time. What is your likely behaviour?',
        options: [
          { id: 'q3-a', text: 'Try to handle everything at once', score: -1 },
          { id: 'q3-b', text: 'Pick tasks randomly to reduce stress', score: -0.5 },
          { id: 'q3-c', text: 'Seek clarity but delay execution', score: 0 },
          { id: 'q3-d', text: 'Prioritise based on urgency and business impact', score: 1 },
        ],
      },
      {
        id: 'q4',
        text: 'Under intense pressure, your thinking pattern is usually:',
        options: [
          { id: 'q4-a', text: 'Disorganised and reactive', score: -1 },
          { id: 'q4-b', text: 'Focused on possible negative outcomes', score: -0.5 },
          { id: 'q4-c', text: 'Alternating between clarity and confusion', score: 0 },
          { id: 'q4-d', text: 'Structured and solution-oriented', score: 1 },
        ],
      },
      {
        id: 'q5',
        text: 'Something goes wrong just before a deadline. What do you focus on first?',
        options: [
          { id: 'q5-a', text: 'Why the issue happened', score: -1 },
          { id: 'q5-b', text: 'The difficulty of fixing it', score: -0.5 },
          { id: 'q5-c', text: 'Both issue and possible fixes', score: 0 },
          { id: 'q5-d', text: 'Immediate next actionable steps', score: 1 },
        ],
      },
    ],
  },
  {
    id: 'trait-2',
    title: 'Grit & Initiative',
    questions: [
      {
        id: 'q6',
        text: 'You are working on a long-term goal with no visible short-term results. What happens to your effort?',
        options: [
          { id: 'q6-a', text: 'It drops quickly', score: -1 },
          { id: 'q6-b', text: 'You continue but need motivation', score: -0.5 },
          { id: 'q6-c', text: 'Effort fluctuates', score: 0 },
          { id: 'q6-d', text: 'Effort remains consistent', score: 1 },
        ],
      },
      {
        id: 'q7',
        text: 'You notice a recurring issue that is not assigned to you. What do you do?',
        options: [
          { id: 'q7-a', text: 'Ignore it', score: -1 },
          { id: 'q7-b', text: 'Mention it casually', score: -0.5 },
          { id: 'q7-c', text: 'Think of solutions but wait', score: 0 },
          { id: 'q7-d', text: 'Take initiative to propose and act', score: 1 },
        ],
      },
      {
        id: 'q8',
        text: 'When a task becomes repetitive:',
        options: [
          { id: 'q8-a', text: 'Your quality drops significantly', score: -1 },
          { id: 'q8-b', text: 'You complete it with minimal effort', score: -0.5 },
          { id: 'q8-c', text: 'You maintain acceptable quality', score: 0 },
          { id: 'q8-d', text: 'You maintain consistent high standards', score: 1 },
        ],
      },
      {
        id: 'q9',
        text: 'You are given a task slightly beyond your current capability:',
        options: [
          { id: 'q9-a', text: 'Avoid it if possible', score: -1 },
          { id: 'q9-b', text: 'Do it only if required', score: -0.5 },
          { id: 'q9-c', text: 'Attempt cautiously', score: 0 },
          { id: 'q9-d', text: 'Treat it as a learning opportunity', score: 1 },
        ],
      },
      {
        id: 'q10',
        text: 'Progress on your work is slower than expected:',
        options: [
          { id: 'q10-a', text: 'You reconsider continuing', score: -1 },
          { id: 'q10-b', text: 'Reduce effort temporarily', score: -0.5 },
          { id: 'q10-c', text: 'Continue but feel uncertain', score: 0 },
          { id: 'q10-d', text: 'Stay persistent and adjust approach', score: 1 },
        ],
      },
    ],
  },
  {
    id: 'trait-3',
    title: 'Professionalism & Workplace Etiquette',
    questions: [
      {
        id: 'q11',
        text: 'You committed to a task but face unexpected personal inconvenience. What do you do?',
        options: [
          { id: 'q11-a', text: 'Miss the deadline without informing', score: -1 },
          { id: 'q11-b', text: 'Inform late and ask for extension', score: -0.5 },
          { id: 'q11-c', text: 'Submit but with reduced quality', score: 0 },
          { id: 'q11-d', text: 'Communicate early and still ensure delivery', score: 1 },
        ],
      },
      {
        id: 'q12',
        text: 'When no one is closely monitoring your work:',
        options: [
          { id: 'q12-a', text: 'You do only what is required', score: -1 },
          { id: 'q12-b', text: 'You focus on avoiding rework', score: -0.5 },
          { id: 'q12-c', text: 'You meet expectations', score: 0 },
          { id: 'q12-d', text: 'You aim to exceed standards', score: 1 },
        ],
      },
      {
        id: 'q13',
        text: 'In a new organisation, how do you handle professional norms?',
        options: [
          { id: 'q13-a', text: 'Ignore them unless told', score: -1 },
          { id: 'q13-b', text: 'Learn only after mistakes', score: -0.5 },
          { id: 'q13-c', text: 'Observe and gradually adapt', score: 0 },
          { id: 'q13-d', text: 'Proactively align early', score: 1 },
        ],
      },
      {
        id: 'q14',
        text: 'While handling sensitive information:',
        options: [
          { id: 'q14-a', text: 'Share if it seems harmless', score: -1 },
          { id: 'q14-b', text: 'Unsure what is sensitive', score: -0.5 },
          { id: 'q14-c', text: 'Mostly careful', score: 0 },
          { id: 'q14-d', text: 'Strictly maintain confidentiality', score: 1 },
        ],
      },
      {
        id: 'q15',
        text: 'In client-facing situations:',
        options: [
          { id: 'q15-a', text: 'Behave casually', score: -1 },
          { id: 'q15-b', text: 'Focus only on task', score: -0.5 },
          { id: 'q15-c', text: 'Maintain some professionalism', score: 0 },
          { id: 'q15-d', text: 'Represent organisation consciously', score: 1 },
        ],
      },
    ],
  },
  {
    id: 'trait-4',
    title: 'Cultural Adaptability & Team Fit',
    questions: [
      {
        id: 'q16',
        text: 'A teammate works very differently from you. What is your response?',
        options: [
          { id: 'q16-a', text: 'Resist their approach', score: -1 },
          { id: 'q16-b', text: 'Tolerate but don’t adapt', score: -0.5 },
          { id: 'q16-c', text: 'Adjust when required', score: 0 },
          { id: 'q16-d', text: 'Actively adapt to collaborate better', score: 1 },
        ],
      },
      {
        id: 'q17',
        text: 'In cross-cultural communication:',
        options: [
          { id: 'q17-a', text: 'Use your default style', score: -1 },
          { id: 'q17-b', text: 'Notice differences but don’t adapt', score: -0.5 },
          { id: 'q17-c', text: 'Adjust slightly', score: 0 },
          { id: 'q17-d', text: 'Tailor communication consciously', score: 1 },
        ],
      },
      {
        id: 'q18',
        text: 'When team members have different perspectives:',
        options: [
          { id: 'q18-a', text: 'Stick to familiar viewpoints', score: -1 },
          { id: 'q18-b', text: 'Listen passively', score: -0.5 },
          { id: 'q18-c', text: 'Consider sometimes', score: 0 },
          { id: 'q18-d', text: 'Actively seek diverse inputs', score: 1 },
        ],
      },
      {
        id: 'q19',
        text: 'When faced with ambiguity or change:',
        options: [
          { id: 'q19-a', text: 'Struggle to proceed', score: -1 },
          { id: 'q19-b', text: 'Wait for clarity', score: -0.5 },
          { id: 'q19-c', text: 'Adapt slowly', score: 0 },
          { id: 'q19-d', text: 'Adjust quickly and move forward', score: 1 },
        ],
      },
      {
        id: 'q20',
        text: 'Different teams use different decision styles (consensus vs authority):',
        options: [
          { id: 'q20-a', text: 'Resist unfamiliar styles', score: -1 },
          { id: 'q20-b', text: 'Follow but feel uncomfortable', score: -0.5 },
          { id: 'q20-c', text: 'Adapt situationally', score: 0 },
          { id: 'q20-d', text: 'Work effectively in both', score: 1 },
        ],
      },
    ],
  },
  {
    id: 'trait-5',
    title: 'Accountability & Self-Awareness',
    questions: [
      {
        id: 'q21',
        text: 'When a project succeeds:',
        options: [
          { id: 'q21-a', text: 'Credit external factors', score: -1 },
          { id: 'q21-b', text: 'Partially take ownership', score: -0.5 },
          { id: 'q21-c', text: 'Share credit equally', score: 0 },
          { id: 'q21-d', text: 'Accurately recognise contributions', score: 1 },
        ],
      },
      {
        id: 'q22',
        text: 'When assessing your own performance:',
        options: [
          { id: 'q22-a', text: 'Overestimate yourself', score: -1 },
          { id: 'q22-b', text: 'Feel unsure', score: -0.5 },
          { id: 'q22-c', text: 'Somewhat accurate', score: 0 },
          { id: 'q22-d', text: 'Realistic and evidence-based', score: 1 },
        ],
      },
      {
        id: 'q23',
        text: 'Your approach to feedback is:',
        options: [
          { id: 'q23-a', text: 'Avoid it', score: -1 },
          { id: 'q23-b', text: 'Accept only when given', score: -0.5 },
          { id: 'q23-c', text: 'Occasionally seek it', score: 0 },
          { id: 'q23-d', text: 'Proactively seek and act', score: 1 },
        ],
      },
      {
        id: 'q24',
        text: 'Awareness of your impact on others:',
        options: [
          { id: 'q24-a', text: 'Rarely aware', score: -1 },
          { id: 'q24-b', text: 'Realise after issues', score: -0.5 },
          { id: 'q24-c', text: 'Sometimes aware', score: 0 },
          { id: 'q24-d', text: 'Actively reflect and adjust', score: 1 },
        ],
      },
      {
        id: 'q25',
        text: 'When facing a setback:',
        options: [
          { id: 'q25-a', text: 'Blame external factors', score: -1 },
          { id: 'q25-b', text: 'Mostly external attribution', score: -0.5 },
          { id: 'q25-c', text: 'Mixed attribution', score: 0 },
          { id: 'q25-d', text: 'Focus on what you can improve', score: 1 },
        ],
      },
    ],
  },
];
