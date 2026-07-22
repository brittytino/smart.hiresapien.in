export interface ISmartQuestion {
  id: string;
  domainId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'mcq' | 'maq' | 'touchboard' | 'oral';
  questionText: string;
  options?: Array<{ label: string; text: string }>;
  correctAnswer?: any; // MCQ: string, MAQ: string[], Touch Board: { xMin: number; xMax: number; yMin: number; yMax: number }, Oral: string[] (keywords)
  svgData?: string; // For touchboard SVG rendering
  promptPlaceholder?: string; // For oral response instructions
  explanation: string;
}

export const SMART_QUESTIONS: ISmartQuestion[] = [
  // 1. Computational Thinking
  {
    id: 'ct-easy',
    domainId: 'computational-thinking',
    difficulty: 'easy',
    questionType: 'mcq',
    questionText: `A stack is used to process a sequence of bracket pairs: '((())())'. If we push '(' to the stack and pop on ')', what is the maximum depth (maximum number of elements in the stack at any point) during the processing?`,
    options: [
      { label: 'A', text: '2' },
      { label: 'B', text: '3' },
      { label: 'C', text: '4' },
      { label: 'D', text: '5' }
    ],
    correctAnswer: 'B',
    explanation: 'The stack operations are: Push, Push, Push (size 3), Pop (size 2), Push (size 3), Pop (size 2), Pop (size 1), Pop (size 0). Maximum stack size is 3.'
  },
  {
    id: 'ct-med',
    domainId: 'computational-thinking',
    difficulty: 'medium',
    questionType: 'mcq',
    questionText: `You are designing a routing algorithm for a warehouse grid. The robot can only move East and South. If the robot starts at (0,0) and needs to reach (3,3), but grid cell (1,2) is blocked by a cargo box, how many unique paths can the robot take?`,
    options: [
      { label: 'A', text: '20' },
      { label: 'B', text: '14' },
      { label: 'C', text: '11' },
      { label: 'D', text: '9' }
    ],
    correctAnswer: 'C',
    explanation: 'Total paths in a 3x3 grid without blocks is 6!/(3!3!) = 20. Paths passing through (1,2) is (paths from 0,0 to 1,2) * (paths from 1,2 to 3,3). Paths to (1,2) = 3!/(1!2!) = 3. Paths from (1,2) to (3,3) = 3!/(2!1!) = 3. Total paths passing through block = 3 * 3 = 9. Unique paths avoiding block = 20 - 9 = 11.'
  },
  {
    id: 'ct-hard',
    domainId: 'computational-thinking',
    difficulty: 'hard',
    questionType: 'mcq',
    questionText: `An algorithm decomposes a list of size N into N/3 subproblems recursively, solves them, and merges them in O(N log N) time. According to the Master Theorem, what is the asymptotic runtime complexity of this recursion: T(N) = 3 * T(N/3) + O(N log N)?`,
    options: [
      { label: 'A', text: 'O(N)' },
      { label: 'B', text: 'O(N log N)' },
      { label: 'C', text: 'O(N log^2 N)' },
      { label: 'D', text: 'O(N^2)' }
    ],
    correctAnswer: 'C',
    explanation: 'Here a=3, b=3. Since f(N) = O(N log N) and N^(log_b a) = N^1 = N. This corresponds to Case 2 of Master Theorem. The runtime complexity is T(N) = O(N log^2 N).'
  },

  // 2. Programming Fundamentals
  {
    id: 'pf-easy',
    domainId: 'programming-fundamentals',
    difficulty: 'easy',
    questionType: 'mcq',
    questionText: `Consider the following JavaScript closure code:
\`\`\`javascript
function createCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}
const counter1 = createCounter();
const counter2 = createCounter();
counter1();
console.log(counter1() + counter2());
\`\`\`
What is printed to the console?`,
    options: [
      { label: 'A', text: '3' },
      { label: 'B', text: '4' },
      { label: 'C', text: '2' },
      { label: 'D', text: '5' }
    ],
    correctAnswer: 'A',
    explanation: 'counter1() is called twice, returning 1, then 2. counter2() is called once, returning 1. 2 + 1 = 3.'
  },
  {
    id: 'pf-med',
    domainId: 'programming-fundamentals',
    difficulty: 'medium',
    questionType: 'maq',
    questionText: `Which of the following OOP principles and behaviors are violated in this TypeScript snippet? (Select ALL that apply)
\`\`\`typescript
class Bird {
  fly() { return "Flying high"; }
}
class Penguin extends Bird {
  fly() { throw new Error("Penguins cannot fly"); }
}
\`\`\``,
    options: [
      { label: 'A', text: 'Liskov Substitution Principle (LSP)' },
      { label: 'B', text: 'Interface Segregation Principle (ISP)' },
      { label: 'C', text: 'Open-Closed Principle (OCP)' },
      { label: 'D', text: 'Single Responsibility Principle (SRP)' }
    ],
    correctAnswer: ['A', 'C'],
    explanation: 'LSP is violated because a subclass (Penguin) cannot be substituted for its parent class (Bird) without throwing errors on base behaviors. OCP is violated because extending the behavior breaks existing contracts.'
  },
  {
    id: 'pf-hard',
    domainId: 'programming-fundamentals',
    difficulty: 'hard',
    questionType: 'mcq',
    questionText: `In a multi-threaded system, you implement a double-checked locking singleton pattern in Java:
\`\`\`java
public static Helper getHelper() {
    if (helper == null) {
        synchronized (Helper.class) {
            if (helper == null) {
                helper = new Helper();
            }
        }
    }
    return helper;
}
\`\`\`
Why is the 'helper' reference required to be declared as 'volatile' in Java?`,
    options: [
      { label: 'A', text: 'To ensure thread access synchronized block sequentially.' },
      { label: 'B', text: 'To prevent out-of-order execution instructions by compiler (instruction reordering), which could return a partially initialized helper object.' },
      { label: 'C', text: 'To guarantee garbage collector does not deallocate helper.' },
      { label: 'D', text: 'To increase the speed of memory read/write cycles.' }
    ],
    correctAnswer: 'B',
    explanation: 'Without volatile, memory writes of the Helper constructor and helper reference can happen out-of-order, allowing another thread to see a non-null but uninitialized helper object.'
  },

  // 3. Frontend Engineering
  {
    id: 'fe-easy',
    domainId: 'frontend-engineering',
    difficulty: 'easy',
    questionType: 'mcq',
    questionText: `Which CSS display value should be set on a parent container to align children horizontally, distribute remaining space evenly between them, and center them vertically?`,
    options: [
      { label: 'A', text: 'display: flex; justify-content: space-between; align-items: center;' },
      { label: 'B', text: 'display: flex; justify-content: space-around; align-items: stretch;' },
      { label: 'C', text: 'display: flex; justify-content: space-evenly; align-items: center;' },
      { label: 'D', text: 'display: grid; justify-items: center; align-content: space-between;' }
    ],
    correctAnswer: 'C',
    explanation: 'display: flex; justify-content: space-evenly; aligns children horizontally with even spaces, and align-items: center; centers them vertically.'
  },
  {
    id: 'fe-med',
    domainId: 'frontend-engineering',
    difficulty: 'medium',
    questionType: 'mcq',
    questionText: `A React functional component re-renders multiple times when typing in an input. To prevent child component components from unnecessary re-renders, what should be done?`,
    options: [
      { label: 'A', text: 'Wrap the child components in React.memo and memoize callback props with useCallback.' },
      { label: 'B', text: 'Convert child components to class components and use componentWillUpdate.' },
      { label: 'C', text: 'Store input value in a global window variable instead of useState.' },
      { label: 'D', text: 'Execute child render triggers inside a useEffect hook.' }
    ],
    correctAnswer: 'A',
    explanation: 'React.memo prevents re-renders of the child if props are unchanged. useCallback prevents reference changes of callback functions passed as props, keeping them unchanged.'
  },
  {
    id: 'fe-hard',
    domainId: 'frontend-engineering',
    difficulty: 'hard',
    questionType: 'touchboard',
    questionText: `The diagram below shows a mock layout of a web portal. An unsized hero image banner causes a severe Layout Shift (CLS) on load, pushing the content down. Click on the container representing the unsized hero banner in the layout structure below to mark it for correction.`,
    svgData: `
      <svg width="100%" height="240" viewBox="0 0 500 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#0b0f19; border: 2px solid #1e293b; border-radius: 12px; cursor: crosshair;">
        <!-- Header -->
        <rect x="10" y="10" width="480" height="35" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="30" y="32" fill="#fff" font-size="12" font-family="sans-serif" font-weight="bold">Global Header (Static)</text>
        
        <!-- Hero Banner (Broken CLS Component) -->
        <rect x="10" y="55" width="480" height="70" rx="6" fill="#1e293b" stroke="#ef4444" stroke-dasharray="4" stroke-width="2"/>
        <text x="30" y="95" fill="#f87171" font-size="13" font-family="sans-serif" font-weight="bold">Broken Hero Image Container (Unsized, dynamic height)</text>
        
        <!-- Main Area -->
        <!-- Sidebar -->
        <rect x="10" y="135" width="120" height="95" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
        <text x="25" y="185" fill="#94a3b8" font-size="11" font-family="sans-serif">Sidebar Nav</text>
        
        <!-- Content Pane -->
        <rect x="140" y="135" width="350" height="95" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
        <text x="160" y="185" fill="#94a3b8" font-size="11" font-family="sans-serif">Main Dynamic Feed Grid</text>
      </svg>
    `,
    correctAnswer: { xMin: 10, xMax: 490, yMin: 55, yMax: 125 }, // Normalized to match 0-500 x 0-240 viewBox
    explanation: 'The dynamic image container (between y=55 and y=125) must be clicked as it lacks a placeholder aspect ratio, triggering Layout Shifts.'
  },

  // 4. Backend Engineering
  {
    id: 'be-easy',
    domainId: 'backend-engineering',
    difficulty: 'easy',
    questionType: 'mcq',
    questionText: `Which HTTP status code should be returned if a client sends a request that lacks valid authentication credentials for the requested resource?`,
    options: [
      { label: 'A', text: '400 Bad Request' },
      { label: 'B', text: '401 Unauthorized' },
      { label: 'C', text: '403 Forbidden' },
      { label: 'D', text: '404 Not Found' }
    ],
    correctAnswer: 'B',
    explanation: '401 Unauthorized indicates that the request lacks authentication credentials. 403 Forbidden indicates the credentials are valid but the user lacks permissions.'
  },
  {
    id: 'be-med',
    domainId: 'backend-engineering',
    difficulty: 'medium',
    questionType: 'mcq',
    questionText: `In building stateless API architectures, a JSON Web Token (JWT) is signed and sent to clients. If a malicious user intercepts the token and alters the payload body (e.g. changing role from "user" to "admin"), how does the backend detect it?`,
    options: [
      { label: 'A', text: 'The payload signature verification fails because the HMAC signature is computed using a secret key only the server knows.' },
      { label: 'B', text: 'The server double-checks the token payload with its cache memory on Redis.' },
      { label: 'C', text: 'The server checks the timestamp to make sure it was not edited.' },
      { label: 'D', text: 'JWT tokens are fully encrypted, so users cannot read or modify the payload.' }
    ],
    correctAnswer: 'A',
    explanation: 'JWT signatures are verified on the server using a secret key. If the payload changes, the computed signature does not match the token signature, making the request fail verification.'
  },
  {
    id: 'be-hard',
    domainId: 'backend-engineering',
    difficulty: 'hard',
    questionType: 'maq',
    questionText: `Which of the following backend strategies are effective at mitigating brute-force authentication attacks on a public HTTP API endpoint? (Select ALL that apply)`,
    options: [
      { label: 'A', text: 'Implementing slide-window rate-limiting on requests matching username and IP address.' },
      { label: 'B', text: 'Encrypting password fields inside database using MD5 hashing standard.' },
      { label: 'C', text: 'Enforcing progressive delays (exponential backoff) on consecutive failed logins.' },
      { label: 'D', text: 'Returning detailed messages like "Username does not exist" or "Incorrect password" to clients.' }
    ],
    correctAnswer: ['A', 'C'],
    explanation: 'Rate-limiting and progressive login delays directly mitigate brute-force attempts. MD5 is insecure and detail-rich error messages assist attackers in enumerating valid usernames.'
  },

  // 5. Database Engineering
  {
    id: 'db-easy',
    domainId: 'database-engineering',
    difficulty: 'easy',
    questionType: 'mcq',
    questionText: `What type of JOIN will return all rows from the left table, and the matched rows from the right table, filling in NULL if there is no match?`,
    options: [
      { label: 'A', text: 'INNER JOIN' },
      { label: 'B', text: 'RIGHT OUTER JOIN' },
      { label: 'C', text: 'LEFT OUTER JOIN' },
      { label: 'D', text: 'FULL OUTER JOIN' }
    ],
    correctAnswer: 'C',
    explanation: 'LEFT JOIN returns all items from the left side, adding matching right-hand columns or NULLs.'
  },
  {
    id: 'db-med',
    domainId: 'database-engineering',
    difficulty: 'medium',
    questionType: 'mcq',
    questionText: `You run a query: \`SELECT name FROM users WHERE age > 25 AND country = 'IN'\`. To optimize this query, what is the best compound index definition?`,
    options: [
      { label: 'A', text: 'CREATE INDEX idx_age_country ON users(age, country);' },
      { label: 'B', text: 'CREATE INDEX idx_country_age ON users(country, age);' },
      { label: 'C', text: 'CREATE INDEX idx_name ON users(name);' },
      { label: 'D', text: 'Two separate indexes: ON users(age) and ON users(country).' }
    ],
    correctAnswer: 'B',
    explanation: 'In composite indexing, place equality filter columns first (\`country\`) followed by range condition columns (\`age\`) to enable optimal index seek operations.'
  },
  {
    id: 'db-hard',
    domainId: 'database-engineering',
    difficulty: 'hard',
    questionType: 'mcq',
    questionText: `Under the SQL-92 isolation levels, which isolation level guarantees prevention of Dirty Reads and Non-Repeatable Reads, but STILL allows Phantom Reads?`,
    options: [
      { label: 'A', text: 'Read Uncommitted' },
      { label: 'B', text: 'Read Committed' },
      { label: 'C', text: 'Repeatable Read' },
      { label: 'D', text: 'Serializable' }
    ],
    correctAnswer: 'C',
    explanation: 'Repeatable Read guarantees prevention of dirty and non-repeatable reads. Phantom reads are only fully prevented at the Serializable level.'
  },

  // 6. Debugging & Quality Engineering
  {
    id: 'dq-easy',
    domainId: 'debugging-quality',
    difficulty: 'easy',
    questionType: 'mcq',
    questionText: `An engineer notes that a function is executing but returning 'undefined' instead of the computed value. What is the most common cause?`,
    options: [
      { label: 'A', text: 'Missing explicit return statement in the function body.' },
      { label: 'B', text: 'Syntax mismatch of variables.' },
      { label: 'C', text: 'Incorrect variable datatypes.' },
      { label: 'D', text: 'Stack overflow errors.' }
    ],
    correctAnswer: 'A',
    explanation: 'A function that executes but yields no return value outputs undefined by default.'
  },
  {
    id: 'dq-med',
    domainId: 'debugging-quality',
    difficulty: 'medium',
    questionType: 'mcq',
    questionText: `In an express handler, you receive:
\`TypeError: Cannot read properties of undefined (reading 'split')\`
The logs show user payload as: \`{ "bio": null }\`.
Which code snippet avoids this error?`,
    options: [
      { label: 'A', text: '\`const words = req.body.bio.split(" ");\`' },
      { label: 'B', text: '\`const words = (req.body.bio || "").split(" ");\`' },
      { label: 'C', text: '\`const words = req.body.bio?.split(" ") || [];\`' },
      { label: 'D', text: 'Both B and C are safe.' }
    ],
    correctAnswer: 'D',
    explanation: 'Optional chaining (?.) or logical OR fallback (||) safe-guards against null or undefined property reads.'
  },
  {
    id: 'dq-hard',
    domainId: 'debugging-quality',
    difficulty: 'hard',
    questionType: 'touchboard',
    questionText: `The code snippet below contains a critical boundary condition error. Click on the line inside the code box that contains the bug causing an array out-of-bounds error.`,
    svgData: `
      <svg width="100%" height="220" viewBox="0 0 500 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#0b0f19; border: 2px solid #1e293b; border-radius: 12px; cursor: crosshair;">
        <rect x="0" y="0" width="100%" height="100%" fill="#0b0f19"/>
        <!-- Line 1 -->
        <text x="20" y="35" fill="#64748b" font-size="12" font-family="monospace">1: function getSum(items) {</text>
        
        <!-- Line 2 -->
        <text x="20" y="65" fill="#64748b" font-size="12" font-family="monospace">2:   let total = 0;</text>
        
        <!-- Line 3 (Buggy Line) -->
        <rect x="15" y="80" width="470" height="25" fill="#ef4444" fill-opacity="0.08" stroke="#ef4444" stroke-opacity="0.2" rx="4"/>
        <text x="20" y="95" fill="#f87171" font-size="12" font-family="monospace">3:   for (let i = 0; i <= items.length; i++) {</text>
        
        <!-- Line 4 -->
        <text x="20" y="125" fill="#64748b" font-size="12" font-family="monospace">4:     total += items[i].price;</text>
        
        <!-- Line 5 -->
        <text x="20" y="155" fill="#64748b" font-size="12" font-family="monospace">5:   }</text>
        
        <!-- Line 6 -->
        <text x="20" y="185" fill="#64748b" font-size="12" font-family="monospace">6:   return total; }</text>
      </svg>
    `,
    correctAnswer: { xMin: 15, xMax: 485, yMin: 80, yMax: 105 }, // Bounding box for Line 3
    explanation: 'Line 3 contains the loop condition \`i <= items.length\`. Since arrays are 0-indexed, referencing \`items[items.length]\` at the final iteration throws a null reference or undefined read exception.'
  },

  // 7. System Design & Architecture
  {
    id: 'sd-easy',
    domainId: 'system-design',
    difficulty: 'easy',
    questionType: 'mcq',
    questionText: `Which system design component acts as a gateway to distribute user traffic evenly across a group of backend web servers to prevent overload?`,
    options: [
      { label: 'A', text: 'Load Balancer' },
      { label: 'B', text: 'Distributed Cache' },
      { label: 'C', text: 'Database Replica' },
      { label: 'D', text: 'Message Queue' }
    ],
    correctAnswer: 'A',
    explanation: 'Load balancers distribute queries across server pools to maintain scaling and availability.'
  },
  {
    id: 'sd-med',
    domainId: 'system-design',
    difficulty: 'medium',
    questionType: 'touchboard',
    questionText: `The system architecture below is designed for high availability, utilizing load balancers and redundant application servers. However, it contains a Single Point of Failure (SPOF). Click on the single component causing the SPOF.`,
    svgData: `
      <svg width="100%" height="240" viewBox="0 0 500 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#0b0f19; border: 2px solid #1e293b; border-radius: 12px; cursor: crosshair;">
        <!-- Client to DNS -->
        <rect x="15" y="90" width="70" height="50" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="32" y="120" fill="#fff" font-size="11" font-family="sans-serif">Clients</text>
        
        <!-- Redundant Load Balancers -->
        <rect x="120" y="45" width="80" height="40" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
        <text x="130" y="68" fill="#94a3b8" font-size="10" font-family="sans-serif">Active LB</text>
        
        <rect x="120" y="145" width="80" height="40" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
        <text x="130" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">Standby LB</text>
        
        <!-- App Servers -->
        <rect x="240" y="45" width="90" height="40" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
        <text x="255" y="68" fill="#94a3b8" font-size="10" font-family="sans-serif">App Srv 1</text>
        
        <rect x="240" y="145" width="90" height="40" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
        <text x="255" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">App Srv 2</text>
        
        <!-- Single Database Instance (SPOF) -->
        <rect x="380" y="90" width="95" height="60" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
        <text x="390" y="120" fill="#fff" font-size="10" font-family="sans-serif" font-weight="bold">Single Master</text>
        <text x="400" y="135" fill="#f87171" font-size="9" font-family="sans-serif">Database</text>
      </svg>
    `,
    correctAnswer: { xMin: 380, xMax: 475, yMin: 90, yMax: 150 }, // Bounding box for Single Database
    explanation: 'The database is a Single Master Database without replicas. If this node fails, the entire application shuts down.'
  },
  {
    id: 'sd-hard',
    domainId: 'system-design',
    difficulty: 'hard',
    questionType: 'oral',
    questionText: `Explain the trade-offs of using optimistic locking vs pessimistic locking in databases under high-concurrency write scenarios. What are the key issues to consider?`,
    promptPlaceholder: 'Click Record and talk about locking concepts like conflicts, retries, bottlenecks, performance, etc.',
    correctAnswer: ['optimistic', 'pessimistic', 'lock', 'retry', 'conflict', 'concurrency', 'overhead', 'blocking'],
    explanation: 'Optimistic locking assumes low conflict, using versions and retries. Pessimistic locking acquires exclusive locks, causing blocking overhead.'
  },

  // 8. AI-Augmented Engineering
  {
    id: 'ai-easy',
    domainId: 'ai-augmented',
    difficulty: 'easy',
    questionType: 'mcq',
    questionText: `Which prompt engineering technique instructs an LLM by providing a few input-output examples before the actual question to set the desired response structure?`,
    options: [
      { label: 'A', text: 'Zero-shot prompting' },
      { label: 'B', text: 'Few-shot prompting' },
      { label: 'C', text: 'Chain of Thought prompting' },
      { label: 'D', text: 'Role prompting' }
    ],
    correctAnswer: 'B',
    explanation: 'Few-shot prompting feeds sample records inside the prompt context to ground output structure.'
  },
  {
    id: 'ai-med',
    domainId: 'ai-augmented',
    difficulty: 'medium',
    questionType: 'mcq',
    questionText: `You asked an AI code assistant to output a React hook that fetches data. The model outputs:
\`\`\`javascript
useEffect(() => {
  fetchData();
}, [fetchData]);
\`\`\`
If \`fetchData\` is recreated on each render, what occurs?`,
    options: [
      { label: 'A', text: 'An infinite render loop occurs, hammering the API.' },
      { label: 'B', text: 'React safely cancels duplicate network calls.' },
      { label: 'C', text: 'A memory leak is automatically avoided by Garbage Collection.' },
      { label: 'D', text: 'The browser halts code execution immediately.' }
    ],
    correctAnswer: 'A',
    explanation: 'Re-creating the callback triggers useEffect to run, causing state updates, re-renders, and infinite calls. memoizing with useCallback is required.'
  },
  {
    id: 'ai-hard',
    domainId: 'ai-augmented',
    difficulty: 'hard',
    questionType: 'oral',
    questionText: `What are the primary intellectual property (IP), licensing, and security risks when copying AI-generated code snippets directly into commercial web applications, and how can an engineering team establish guards?`,
    promptPlaceholder: 'Click Record and speak about issues like copyright, copyleft, GPL, license violation, security vulnerabilities, code scans, or peer review.',
    correctAnswer: ['license', 'copyright', 'copyleft', 'vulnerabilit', 'scan', 'review', 'compliance', 'ip'],
    explanation: 'AI models can output code matching copyleft licenses (GPL) or containing security vulnerabilities. Teams should use code scanning utilities and enforce code review audits.'
  }
];
