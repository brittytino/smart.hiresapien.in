/**
 * Layer 1: Static Source Verification
 * Verifies that all Phase 1 bug fixes are present in the source code.
 * Run with: node tests/verify-source.js
 * No dependencies required.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function read(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function check(bugId, description, filePath, assertion) {
  const src = read(filePath);
  if (src === null) {
    console.log(`  FAIL  [${bugId}] ${description}`);
    console.log(`         File not found: ${filePath}`);
    failed++;
    return;
  }
  const result = assertion(src);
  if (result === true) {
    console.log(`  PASS  [${bugId}] ${description}`);
    passed++;
  } else {
    console.log(`  FAIL  [${bugId}] ${description}`);
    if (typeof result === 'string') console.log(`         ${result}`);
    failed++;
  }
}

function contains(src, pattern) {
  if (typeof pattern === 'string') return src.includes(pattern);
  return pattern.test(src);
}

function notContains(src, pattern) {
  if (typeof pattern === 'string') return !src.includes(pattern);
  return !pattern.test(src);
}

// ─── ExamPortalMain.jsx ───────────────────────────────────────────────────────
const EXAM_MAIN = 'components/exam-portal/ExamPortalMain.jsx';

console.log('\n=== ExamPortalMain.jsx ===');

check('BUG-11', 'Warning threshold is >= 3 (not > 5)', EXAM_MAIN, src => {
  if (!contains(src, 'if (newCount >= 3)'))
    return 'Expected: if (newCount >= 3)  — old code used > 5';
  if (contains(src, 'if (newCount > 5)'))
    return 'Old bug still present: if (newCount > 5)';
  return true;
});

check('BUG-23', 'Submit button uses isTestComplete variable (not hardcoded)', EXAM_MAIN, src => {
  if (!contains(src, 'isTestComplete={isTestComplete}'))
    return 'Expected: isTestComplete={isTestComplete}';
  if (contains(src, 'isTestComplete={isLastDomain && isLastQuestionInDomain}'))
    return 'Old bug still present: hardcoded isLastDomain condition';
  return true;
});

check('BUG-24', 'Min 25% answers required before submit (Math.ceil + 0.25)', EXAM_MAIN, src => {
  if (!contains(src, 'Math.ceil(totalQs * 0.25)'))
    return 'Expected: Math.ceil(totalQs * 0.25) in handleSubSkillSubmit';
  return true;
});

check('BUG-30', 'handleNext does NOT auto-submit on last question', EXAM_MAIN, src => {
  // Extract the handleNext function body
  const fnStart = src.indexOf('const handleNext = ');
  if (fnStart === -1) return 'handleNext function not found';
  // Find the closing of the function by counting braces
  let depth = 0;
  let inFn = false;
  let fnEnd = fnStart;
  for (let i = fnStart; i < src.length; i++) {
    if (src[i] === '{') { depth++; inFn = true; }
    if (src[i] === '}') { depth--; }
    if (inFn && depth === 0) { fnEnd = i; break; }
  }
  const handleNextBody = src.slice(fnStart, fnEnd + 1);
  if (contains(handleNextBody, 'handleSubSkillSubmit'))
    return 'BUG still present: handleNext calls handleSubSkillSubmit (auto-submits on last question)';
  return true;
});

check('BUG-32', 'Answer restore uses domainQs.findIndex (not direct q.index)', EXAM_MAIN, src => {
  if (!contains(src, 'domainQs.findIndex'))
    return 'Expected: domainQs.findIndex in answer restore block';
  return true;
});

check('BUG-36', 'fetchTestData checks ALREADY_SUBMITTED code', EXAM_MAIN, src => {
  if (!contains(src, "data.code === 'ALREADY_SUBMITTED'"))
    return "Expected: data.code === 'ALREADY_SUBMITTED'";
  return true;
});

check('BUG-17', 'examSessionActive used for proctoring (not isExamStarted only)', EXAM_MAIN, src => {
  if (!contains(src, 'examSessionActive'))
    return 'Expected: examSessionActive state in source';
  // The proctoring useEffect should depend on examSessionActive
  if (!contains(src, '[examSessionActive]'))
    return 'Expected: useEffect depends on [examSessionActive]';
  return true;
});

check('BUG-18', 'warningCountRef incremented directly (stale closure fix)', EXAM_MAIN, src => {
  if (!contains(src, 'warningCountRef.current += 1'))
    return 'Expected: warningCountRef.current += 1';
  if (!contains(src, 'const newCount = warningCountRef.current'))
    return 'Expected: const newCount = warningCountRef.current';
  return true;
});

check('BUG-31', 'Window blur event listener added for tab-switching detection', EXAM_MAIN, src => {
  if (!contains(src, 'window.addEventListener("blur", handleWindowBlur)'))
    return 'Expected: window.addEventListener("blur", handleWindowBlur)';
  return true;
});

check('BUG-33', 'onBack={null} — Return Home button never shown', EXAM_MAIN, src => {
  if (!contains(src, 'onBack={null}'))
    return 'Expected: onBack={null} passed to Header';
  return true;
});

check('BUG-38', 'user-select: none applied during examSessionActive', EXAM_MAIN, src => {
  if (!contains(src, "userSelect: 'none'"))
    return "Expected: userSelect: 'none' in examContentStyle";
  if (!contains(src, 'examSessionActive'))
    return 'Expected: examSessionActive guard for userSelect';
  return true;
});

check('BUG-26', 'guidelinesAcknowledged state controls guidelines display', EXAM_MAIN, src => {
  if (!contains(src, 'guidelinesAcknowledged'))
    return 'Expected: guidelinesAcknowledged state';
  if (!contains(src, 'setGuidelinesAcknowledged'))
    return 'Expected: setGuidelinesAcknowledged setter';
  return true;
});

// ─── QuestionArea.jsx ─────────────────────────────────────────────────────────
const QUESTION_AREA = 'components/exam-portal/QuestionArea/QuestionArea.jsx';

console.log('\n=== QuestionArea.jsx ===');

check('BUG-14', 'Difficulty badge present (showDifficulty)', QUESTION_AREA, src => {
  if (!contains(src, 'showDifficulty'))
    return 'Expected: showDifficulty variable';
  if (!contains(src, '{showDifficulty &&'))
    return 'Expected: {showDifficulty && ... badge rendering';
  return true;
});

check('BUG-35', 'Word count minimum 20 words enforced with amber indicator', QUESTION_AREA, src => {
  if (!contains(src, 'MIN_WORDS_WRITTEN = 20'))
    return 'Expected: MIN_WORDS_WRITTEN = 20';
  if (!contains(src, '#f59e0b'))
    return 'Expected: amber color #f59e0b for word count warning';
  if (!contains(src, 'minimum ${MIN_WORDS_WRITTEN} words required'))
    return 'Expected: minimum words required message';
  return true;
});

check('BUG-29', 'Previous button exists with disabled-on-first-question logic', QUESTION_AREA, src => {
  if (!contains(src, 'onPrevious'))
    return 'Expected: onPrevious prop';
  if (!contains(src, 'isFirstQuestion'))
    return 'Expected: isFirstQuestion variable';
  if (!contains(src, 'disabled={isFirstQuestion}'))
    return 'Expected: disabled={isFirstQuestion} on Previous button';
  if (!contains(src, '← Previous'))
    return 'Expected: ← Previous button text';
  return true;
});

// ─── ImagePanel.jsx ───────────────────────────────────────────────────────────
const IMAGE_PANEL = 'components/exam-portal/ImagePanel/ImagePanel.jsx';

console.log('\n=== ImagePanel.jsx ===');

check('BUG-34', 'Click-outside closes image overlay; inner card stops propagation', IMAGE_PANEL, src => {
  if (!contains(src, 'onClick={() => setIsFullscreen(false)}'))
    return 'Expected: overlay onClick closes fullscreen';
  if (!contains(src, 'onClick={(e) => e.stopPropagation()}'))
    return 'Expected: inner card stops click propagation';
  return true;
});

// ─── admin/dashboard.tsx ──────────────────────────────────────────────────────
const ADMIN_DASHBOARD = 'components/admin/dashboard.tsx';

console.log('\n=== admin/dashboard.tsx ===');

check('BUG-06', 'Generate PRI button exists in admin dashboard', ADMIN_DASHBOARD, src => {
  if (!contains(src, 'Generate PRI'))
    return 'Expected: "Generate PRI" text in dashboard';
  return true;
});

check('BUG-07', 'Back navigation uses setActiveTab (not window.history.back)', ADMIN_DASHBOARD, src => {
  if (contains(src, 'window.history.back'))
    return 'BUG still present: window.history.back() found — should use setActiveTab';
  if (!contains(src, "setActiveTab('pri-tests')"))
    return "Expected: setActiveTab('pri-tests') for back navigation";
  return true;
});

// ─── models/QuestionBank.ts ───────────────────────────────────────────────────
const QUESTION_BANK_MODEL = 'models/QuestionBank.ts';

console.log('\n=== models/QuestionBank.ts ===');

check('BUG-02a', "QuestionBank status enum includes 'completed'", QUESTION_BANK_MODEL, src => {
  if (!contains(src, "'completed'"))
    return "Expected: 'completed' in status enum array";
  if (!contains(src, "enum: ['draft', 'published', 'completed']"))
    return "Expected: enum: ['draft', 'published', 'completed']";
  return true;
});

// ─── models/PriTestBank.ts ────────────────────────────────────────────────────
const PRI_TEST_BANK_MODEL = 'models/PriTestBank.ts';

console.log('\n=== models/PriTestBank.ts ===');

check('BUG-02b', "PriTestBank status enum includes 'completed'", PRI_TEST_BANK_MODEL, src => {
  if (!contains(src, "'completed'"))
    return "Expected: 'completed' in status enum array";
  if (!contains(src, "enum: ['draft', 'published', 'completed']"))
    return "Expected: enum: ['draft', 'published', 'completed']";
  return true;
});

// ─── components/exam-portal/Home/Home.jsx ─────────────────────────────────────
const HOME = 'components/exam-portal/Home/Home.jsx';

console.log('\n=== components/exam-portal/Home/Home.jsx ===');

check('BUG-08a', 'Student Home shows NIL instead of fake PRI score', HOME, src => {
  if (!contains(src, 'NIL'))
    return 'Expected: "NIL" text for unevaluated PRI score';
  if (contains(src, "'78%'") || contains(src, '"78%"'))
    return 'BUG still present: hardcoded 78% score found';
  return true;
});

check('BUG-08b', 'Student Home shows Not Evaluated status', HOME, src => {
  if (!contains(src, 'Not Evaluated'))
    return 'Expected: "Not Evaluated" placement status';
  if (contains(src, "'Almost Ready'") || contains(src, '"Almost Ready"'))
    return 'BUG still present: hardcoded "Almost Ready" found';
  return true;
});

// ─── components/student/insights/StudentInsights.tsx ─────────────────────────
const STUDENT_INSIGHTS = 'components/student/insights/StudentInsights.tsx';

console.log('\n=== components/student/insights/StudentInsights.tsx ===');

check('BUG-09', 'ENDS IN countdown timer present for active exam', STUDENT_INSIGHTS, src => {
  if (!contains(src, 'ENDS IN'))
    return 'Expected: "ENDS IN" countdown timer card';
  if (!contains(src, 'examEndDate'))
    return 'Expected: examEndDate used for countdown calculation';
  return true;
});

// ─── API route: pri-tests/[id]/route.ts ───────────────────────────────────────
const PRI_TESTS_ROUTE = 'app/api/admin/pri-tests/[id]/route.ts';

console.log('\n=== app/api/admin/pri-tests/[id]/route.ts ===');

check('BUG-03', 'PUT handler syncs status to PriTestBank', PRI_TESTS_ROUTE, src => {
  if (!contains(src, 'PriTestBank'))
    return 'Expected: PriTestBank referenced in route handler';
  if (!contains(src, 'findOneAndUpdate'))
    return 'Expected: PriTestBank.findOneAndUpdate in PUT handler';
  return true;
});

check('BUG-04', 'DELETE handler uses $or for both ObjectId and string IDs', PRI_TESTS_ROUTE, src => {
  if (!contains(src, '$or'))
    return 'Expected: $or operator for cascade delete matching both ID types';
  if (!contains(src, 'questionBankId: bankId') || !contains(src, 'questionBankId: id'))
    return 'Expected: cascade delete matches both bankId (ObjectId) and id (string)';
  return true;
});

// ─── API route: evaluate/route.ts ─────────────────────────────────────────────
const EVALUATE_ROUTE = 'app/api/admin/pri-tests/[id]/evaluate/route.ts';

console.log('\n=== app/api/admin/pri-tests/[id]/evaluate/route.ts ===');

check('BUG-05', 'Evaluate route file exists with POST and GET handlers', EVALUATE_ROUTE, src => {
  if (src === null) return 'Evaluate route file not found — endpoint was never created';
  if (!contains(src, 'export async function POST'))
    return 'Expected: export async function POST';
  if (!contains(src, 'export async function GET'))
    return 'Expected: export async function GET';
  return true;
});

check('BUG-28', 'NaN/Infinity guard in evaluate route (e.percentage ?? 0)', EVALUATE_ROUTE, src => {
  if (!contains(src, 'e.percentage ?? 0') && !contains(src, 'e?.percentage ?? 0'))
    return 'Expected: e.percentage ?? 0 (null guard in reduce)';
  if (!contains(src, 'isFinite'))
    return 'Expected: isFinite(totalScore) guard before Math.min';
  return true;
});

// ─── API route: student/pri-test/route.ts ─────────────────────────────────────
const STUDENT_ROUTE = 'app/api/student/pri-test/route.ts';

console.log('\n=== app/api/student/pri-test/route.ts ===');

check('BUG-37', 'Student API caps questions per domain by questionCount', STUDENT_ROUTE, src => {
  if (!contains(src, 'questionCount'))
    return 'Expected: questionCount cap logic in student route';
  if (!contains(src, 'domainQuestionCaps') && !contains(src, 'questionCap') && !contains(src, 'cap'))
    return 'Expected: question cap variable in student route';
  return true;
});

check('BUG-25', 'Student API does not filter questions by active domain time slots', STUDENT_ROUTE, src => {
  if (contains(src, 'activeDomainIds'))
    return 'BUG still present: activeDomainIds time-slot filter is still in place';
  return true;
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(55));
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} checks`);
console.log('─'.repeat(55));

if (failed > 0) {
  console.log('\nFAILED — one or more bug fixes are missing or incorrect.\n');
  process.exit(1);
} else {
  console.log('\nALL CHECKS PASSED — all source-level bug fixes are in place.\n');
  process.exit(0);
}
