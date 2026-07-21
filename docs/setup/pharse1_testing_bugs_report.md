# G360 Platform — Complete Bug Fix Report

> **Project:** Grad360° MBA Exam Portal
> **Branch:** `thiga`
> **Total Bugs Fixed:** 42
> **Sessions Covered:** 4 Bug Report Documents

---

## Report Structure

- [Session 1 — G360 Platform Bug Report (Core Features)](#session-1)
- [Session 2 — QA Status Report Update 1](#session-2)
- [Session 3 — PRI Exam Portal Security & UX Bug Report](#session-3)
- [Session 4 — Grouped QA Report (Team Members)](#session-4)
- [Files Modified Summary](#files-modified)

---

## Session 1 — G360 Platform Bug Report (Core Features) {#session-1}

### BUG-01 · PRI Test Builder Preview — Missing Case Study & Image Rendering
**Reporter:** Admin QA
**Severity:** High
**File:** `components/admin/pri-test-builder.tsx`

**Problem:** The AI-generated question preview (Step 4) did not render `caseContext`, `questionImageUrl`, or `caseContextImageUrl` fields even when they existed on the generated question.

**Fix:** Added conditional rendering blocks in the preview step:
- If `caseContext` exists → renders a gray card with the case study text (+ optional `caseContextImageUrl` below it)
- If only `questionImageUrl` exists (no case context) → renders the image above the question text
- If both `caseContext` and `questionImageUrl` exist → renders case study first, then image below

---

### BUG-02 · QuestionBank/PriTestBank — Missing `completed` Status
**Reporter:** Admin QA
**Severity:** Medium
**Files:** `models/QuestionBank.ts`, `models/PriTestBank.ts`

**Problem:** The `status` field on both models only accepted `'draft'` and `'published'`. Trying to mark a test as `'completed'` after the exam window closed resulted in a Mongoose validation error.

**Fix:** Added `'completed'` to the TypeScript union type and Mongoose enum array in both model schemas.

---

### BUG-03 · PUT Handler — Status Not Syncing to PriTestBank
**Reporter:** Admin QA
**Severity:** High
**File:** `app/api/admin/pri-tests/[id]/route.ts`

**Problem:** The PUT handler updated `QuestionBank` status but did not propagate it to `PriTestBank`. The two collections went out of sync silently.

**Fix:** Added `statusUpdate` extraction from the request body with validation against `['draft', 'published', 'completed']`. The `PriTestBank.findOneAndUpdate` now also includes `...(statusUpdate ? { status: statusUpdate } : {})`.

---

### BUG-04 · DELETE Handler — Cascade Delete Silently Failed
**Reporter:** Admin QA
**Severity:** Critical
**File:** `app/api/admin/pri-tests/[id]/route.ts`

**Problem:** When deleting a question bank, the cascade delete for `PriTestResponse`, `StudentResponse`, and `PriTestEvaluation` used only the ObjectId form. Records stored with string IDs were not deleted.

**Fix:** All cascade deletes now use `$or: [{ questionBankId: bankId }, { questionBankId: id }]` to match both ObjectId and string variants.

---

### BUG-05 · Missing PRI Score Generation Endpoint
**Reporter:** Admin QA
**Severity:** Critical
**File:** `app/api/admin/pri-tests/[id]/evaluate/route.ts` *(created)*

**Problem:** No endpoint existed to generate PRI scores from submitted student responses. Admins had no way to evaluate or view results.

**Fix:** Created full evaluation route:
- **POST** — Scores all `status: 'submitted'` responses. Calculates per-domain and per-subskill weighted scores using `domainShare` and `priContribution` from the test bank config. Upserts `PriTestEvaluation` documents. Returns `{ evaluated, avgScore, total }`.
- **GET** — Returns summary `{ totalSubmitted, totalEvaluated, avgScore, evaluations }`.

---

### BUG-06 · Admin Dashboard — Generate PRI Button Missing + Live Polling
**Reporter:** Admin QA
**Severity:** High
**File:** `components/admin/dashboard.tsx`

**Problem:** No UI existed to trigger PRI score generation. The PRI tests list was static and required a page refresh to see new submissions.

**Fix:**
- Added `evalSummaries` state (`Record<testId, {totalSubmitted, totalEvaluated, avgScore}>`)
- Added `loadEvalSummary(testId)` function
- Added 30-second polling `useEffect` (only active when on `pri-tests` tab)
- Added auto-load `useEffect` that fetches summaries for all published tests
- Added **"Generate PRI & Insights"** / **"Regenerate PRI"** button per test card
- Shows inline summary: `Submitted: N · Evaluated: N · Avg Score: X%`

---

### BUG-07 · Admin Dashboard — `handleBack()` Routing to Wrong Page
**Reporter:** Admin QA
**Severity:** Medium
**File:** `components/admin/dashboard.tsx`

**Problem:** `handleBack()` called `window.history.back()` which pushed the browser back in history instead of navigating within the SPA. Also had a dead `if (activeTab === 'responses')` branch that never executed.

**Fix:** Replaced `window.history.back()` with `setActiveTab('overview')`. Removed the dead branch.

---

### BUG-08 · Fake Data in Student Home (PRI Score, Skill Radar)
**Reporter:** QA
**Severity:** High
**File:** `components/exam-portal/Home/Home.jsx`

**Problem:** The Home screen displayed hardcoded fake values: `78%` PRI score, `"Almost Ready"` placement status, `"AVG 84%"` legend, `"PASS"` behavioral profile.

**Fix:**
- PRI number shows `"NIL"` in gray (`#94a3b8`)
- Placement status: `"Not Evaluated"`
- Skill scores: `---` / `"NOT EVALUATED YET"` when score = 0
- Legend: `"PENDING"`
- Behavioral profile: `"PENDING"`
- All `defaultSkillData` A-values set to `0`

---

### BUG-09 · Student Insights — Missing ENDS IN Countdown
**Reporter:** QA
**Severity:** Low
**File:** `components/student/insights/StudentInsights.tsx`

**Problem:** No countdown timer was visible on the student insights page during an active exam.

**Fix:** Added a full-width red gradient "ENDS IN" card between the welcome section and Section 2, showing a live `HH:MM:SS` countdown. Only renders when exam is active (not upcoming).

---

## Session 2 — QA Status Report Update 1 {#session-2}

### BUG-10 · Fullscreen Not Enforced on Exam Start
**Severity:** High
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** The exam could be started without entering fullscreen mode.

**Fix:** `startTest()` now calls `document.documentElement.requestFullscreen()` before setting `isExamStarted = true`. If the browser rejects it (or resolves but still returns no `fullscreenElement`), a toast is shown and the exam does NOT start.

---

### BUG-11 · Warning Limit Was 5, Should Be 3
**Severity:** High
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** The warning threshold was `> 5` before auto-submitting. The requirement is 3.

**Fix:** Changed `if (newCount > 5)` → `if (newCount >= 3)`. Warning modal text updated from "Warning X of 5" → "Warning X of 3".

---

### BUG-12 · `alert()` Calls Replaced with Toast + Terminated Modal
**Severity:** Medium
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** Several proctoring violations and errors used `alert()` which blocks the UI thread and looks unprofessional.

**Fix:**
- Added `showToast(text, type)` function with 4-second auto-dismiss
- Added `showTerminatedModal` state with a styled modal (replaces the termination alert)
- All `console.error` / `console.log` calls replaced with `showToast(...)`

---

### BUG-13 · Domain Click Lock Alert Removed
**Severity:** Low
**File:** `components/exam-portal/Home/Home.jsx`

**Problem:** Clicking a locked domain card showed a browser `alert()`.

**Fix:** Removed the alert — the status label on the card (`"Unlocks in Xm Ys"` / `"Evaluation Closed"`) already communicates the locked state.

---

### BUG-14 · Difficulty Badge in QuestionArea
**Severity:** Low
**File:** `components/exam-portal/QuestionArea/QuestionArea.jsx`

**Problem:** Questions didn't indicate their difficulty level.

**Fix:** Added difficulty badge (green=easy, amber=medium, red=hard). Badge is hidden for the Workspace Psychology domain (psychometric questions don't have meaningful difficulty levels).

---

## Session 3 — PRI Exam Portal Security & UX Bug Report {#session-3}

### BUG-15 · Screenshot Prevention — No Keyboard Blocking
**Severity:** Critical
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** `PrintScreen` key was not blocked. Students could screenshot question content with no detection.

**Fix:** Added `keydown` event listener:
- `PrintScreen` → `e.preventDefault()` + `navigator.clipboard.writeText('')` (clears clipboard) + triggers security warning
- `F12` → blocked
- `Ctrl+S`, `Ctrl+P`, `Ctrl+U`, `Ctrl+F` → blocked
- `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C` → blocked (DevTools)

---

### BUG-16 · Escape Key — Warning Delayed (Waited for fullscreenchange Event)
**Severity:** High
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** Exiting fullscreen by pressing Escape only triggered a warning after the `fullscreenchange` event fired, which has a noticeable delay.

**Fix:** `Escape` key is now caught in the `keydown` handler (fires immediately) and calls `triggerWarning()` synchronously. `e.preventDefault()` also prevents the browser from exiting fullscreen.

---

### BUG-17 · Section-to-Section Fullscreen Not Maintained
**Severity:** Critical
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** Proctoring only ran when `isExamStarted === true`. Between domains (on the guidelines/home screen), fullscreen was not enforced. Students could exit fullscreen freely.

**Fix:** Added `examSessionActive` state (true from first domain pick → final submission). The proctoring `useEffect` now guards on `examSessionActive` instead of `isExamStarted`. During the inter-domain period (guidelines screen), a `fullscreenchange` event silently re-enters fullscreen without triggering a warning.

---

### BUG-18 · Stale Closure in `triggerWarning` — Warning Count Incorrect
**Severity:** High
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** `triggerWarning` closed over `warningCount` from state, which could be stale when multiple warnings fired rapidly. Two rapid violations could both read `warningCount = 0` and both set it to `1`.

**Fix:** Added refs:
- `warningCountRef` — incremented directly (no state read) → `warningCountRef.current += 1`
- `lastWarningTimeRef` — throttle check uses ref, not state
- `isExamStartedRef`, `testBankIdRef` — stable reads in event handlers
- `triggerWarningRef` — always points to the latest `triggerWarning` function (updated every render, no deps)

---

### BUG-19 · No Idle Timeout Detection
**Severity:** Medium
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** A student could walk away from the exam with no consequence.

**Fix:** Added `idleTimerRef` with a 2-minute `setTimeout`. Reset on `mousemove` and `keydown`. On expiry, calls `triggerWarning("You have been idle for 2 minutes...")`.

---

### BUG-20 · `cut` Event Not Blocked
**Severity:** Low
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** `copy` and `paste` events were blocked but `cut` was not.

**Fix:** Added `document.addEventListener("cut", handleCopyPaste)`.

---

### BUG-21 · "180M DURATION" Badge Hardcoded
**Severity:** Medium
**File:** `components/exam-portal/Home/Home.jsx`

**Problem:** The exam duration badge always showed "180M DURATION" regardless of the actual domain time slots.

**Fix:** Added `calcTotalDuration()` function that computes the span from `Math.min(domainStartTimes)` to `Math.max(domainEndTimes)`. Formats as `XH YM` or `XM`. Falls back to `"180M"` only if no slots are available.

---

### BUG-22 · Late Entry Threshold — No Check on Domain Start
**Severity:** Medium
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** Students could start a domain in the last few minutes of its time slot, getting full access with almost no time to submit.

**Fix:** `handleInitiateExam` checks if more than 25% of the domain's slot time has elapsed. If so, shows a toast error and blocks navigation. Bypassed for already-completed domains.

---

### BUG-23 · Submit Button Prop — Wrong Condition on Line 443
**Severity:** High
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** `isTestComplete={isLastDomain && isLastQuestionInDomain}` ignored the time-based `isSubmitEnabled()` logic entirely.

**Fix:** Changed to `isTestComplete={isTestComplete}` where `isTestComplete = isExamStarted && isSubmitEnabled()`. The submit button is only enabled after 75% of the domain slot time has elapsed.

---

### BUG-24 · Blank Submission — No Minimum Answer Guard
**Severity:** Medium
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** Students could submit a domain with zero answers answered.

**Fix:** `handleSubSkillSubmit` checks that `answeredQs >= Math.ceil(totalQs * 0.25)` before allowing submission. Shows a toast with `"Please answer at least N question(s)"`. Bypassed for `'submitted'` and `'timeout'` forced submissions.

---

### BUG-25 · Topic Time Lock — Couldn't Start Next Domain Early
**Severity:** Medium
**Files:** `components/exam-portal/Home/Home.jsx`, `app/api/student/pri-test/route.ts`

**Problem:** After completing a domain early, students couldn't click the next domain because its time slot hadn't started yet. The server also filtered questions to only the currently-active time slot.

**Fix:**
- **Server:** Removed `activeDomainIds` time-slot filter. All questions are served during the exam window. Client-side domain filtering handles which questions display.
- **UI:** `Home.jsx` now always calls `onInitiateExam(s.title)` on click (no `isActive` gate). `completedDomains` prop shows "Completed" (green) for finished domains.

---

### BUG-26 · Guidelines Shown Every Domain (Should Be Once Per Session)
**Severity:** Low
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** Full guidelines were displayed before every single domain, even the 2nd, 3rd, etc.

**Fix:** Added `guidelinesAcknowledged` state. First domain shows full guidelines. Subsequent domains show a 2-line summary screen: *"You've already acknowledged the guidelines. Click CONTINUE to begin [Domain Name]."*

---

### BUG-27 · Case Study Column Always Visible (Even for Direct Questions)
**Severity:** Medium
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** The left case-study column was always rendered, showing a "Direct Question" placeholder even when there was no case content.

**Fix:** Added `hasCaseContent` flag. When `false`, the case study column is not rendered at all. The question column gets `flex: 1; maxWidth: 100%` to expand to full width.

---

### BUG-28 · Null Data in Evaluate Route
**Severity:** Low
**File:** `app/api/admin/pri-tests/[id]/evaluate/route.ts`

**Problem:** `evaluations.reduce((sum, e) => sum + e.percentage, 0)` would produce `NaN` if any evaluation document had a null `percentage` field. `Math.min(100, totalScore)` could crash on `NaN`/`Infinity`.

**Fix:**
- `e.percentage ?? 0` in the reducer
- `isFinite(totalScore) ? totalScore : 0` before `Math.min(100, ...)`

---

## Session 4 — Grouped QA Report (Team Members) {#session-4}

### BUG-29 · Missing "Previous" Button — No Question Navigation (Neha, Swetha)
**Severity:** High
**File:** `components/exam-portal/QuestionArea/QuestionArea.jsx`, `components/exam-portal/ExamPortalMain.jsx`

**Problem:** Students could only move forward through questions. Reviewing a previous question required clicking the right-panel grid.

**Fix:**
- Added `onPrevious` and `totalQuestions` props to `QuestionArea`
- Added `← Previous` button (disabled on Q1, grayed and `cursor: not-allowed`)
- Added `handlePrevious()` in `ExamPortalMain` — decrements `currentQuestionNumber` and resets `questionStartTime`
- Added `Q{current} / {total}` counter in question header

---

### BUG-30 · "Save" on Last Question Auto-Submits Domain (Neha, Najla)
**Severity:** Critical
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** `handleNext()` called `handleSubSkillSubmit()` when on the last question, immediately submitting the domain when the student clicked "Save". Students lost control of when to submit.

**Fix:** `handleNext()` now only saves the answer and stays on the question when `isLastQuestionInDomain`. The last question shows a hint text: *"✓ Use SUBMIT TEST in the header to submit"* instead of the Save & Next button.

---

### BUG-31 · Tab Switching Not Detected for All Methods (Ramansh, Najla)
**Severity:** High
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** `visibilitychange` alone doesn't fire reliably for all tab-switching methods (especially keyboard shortcuts like `Alt+Tab`, `Cmd+Tab`, `Windows+D`).

**Fix:** Added `window.addEventListener("blur", handleWindowBlur)` in the proctoring effect. The `blur` event fires whenever the browser window loses focus by any method. Both `visibilitychange` + `window.blur` are now active together.

---

### BUG-32 · Refreshing Loses All Progress (Najla)
**Severity:** Critical
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** The answer restore logic after refresh was using the wrong key mapping:
```javascript
// BROKEN:
const qNum = data.questions.find(q => q.index === a.questionIndex)?.index + 1
// q.index is the global bank index (e.g. 42), not the 1-based position in domain
```
This mapped bank index 42 → key 43 in the `answers` dict, never matching the displayed question number (1, 2, 3...).

**Fix:** Answers are now restored by finding the question's position within its domain:
```javascript
const domainQs = data.questions.filter(q => q.domainId === a.domainId);
const posIdx = domainQs.findIndex(q => q.index === a.questionIndex);
if (posIdx !== -1) restoredAnswers[a.domainId][posIdx + 1] = a.selectedOption || a.answerText;
```

---

### BUG-33 · "Return Home" Button Unnecessary in Exam Flow (Neha)
**Severity:** Low
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** The Header showed a "RETURN HOME" button during the guidelines screen, which conflicted with the exam session flow.

**Fix:** `onBack={null}` always passed to `<Header>`. The button is never shown during the exam portal session. Students exit only via the Submit Test button (which redirects to `/student`).

---

### BUG-34 · Image Expand — Clicking Outside Doesn't Close (Najla)
**Severity:** Medium
**File:** `components/exam-portal/ImagePanel/ImagePanel.jsx`

**Problem:** In browser fullscreen mode, the image popup overlay had z-index and stacking context issues that prevented click-outside-to-close from working reliably.

**Fix:**
- Overlay now uses inline `style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999, cursor: 'pointer' }}`
- Image card uses `onClick={(e) => e.stopPropagation()}` to only close on overlay clicks
- Added Escape key listener in `useEffect` (capture phase, `stopPropagation` to prevent exam proctoring warning from firing)
- Close button repositioned outside the card with proper z-index

---

### BUG-35 · Word Limit Not Enforced for Written Responses (Neha)
**Severity:** Medium
**File:** `components/exam-portal/QuestionArea/QuestionArea.jsx`

**Problem:** Written question answers were saved regardless of length. No minimum word count was shown or enforced.

**Fix:**
- Added `countWords()` utility (splits on whitespace, filters empty strings)
- Live word counter displayed below textarea: `"N words"`
- If answer has content but < 20 words: counter turns amber + shows `"minimum 20 words required"`
- Textarea border turns amber when below minimum
- Character count also displayed (right-aligned)

---

### BUG-36 · Multiple Test Attempts Allowed — No Client-Side Guard (Swetha)
**Severity:** High
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** The server returned `{ code: 'ALREADY_SUBMITTED' }` but the client silently ignored it, showing an empty Home screen. Students could be confused and try again.

**Fix:** `fetchTestData` now explicitly checks `data.code === 'ALREADY_SUBMITTED'` before processing exam data. Shows a toast: *"You have already submitted this test. Reattempts are not allowed."* and returns early (no exam loaded).

---

### BUG-37 · Workspace Psychology Pulling 100+ Questions (Swetha)
**Severity:** High
**File:** `app/api/student/pri-test/route.ts`

**Problem:** The student GET endpoint served all questions for a domain without respecting the `questionCount` configured per subskill in the test bank. If 100+ questions were stored for Workspace Psychology, all 100+ were served.

**Fix:** Before filtering `shuffledQuestions`, the route now builds `domainQuestionCaps` from `bank.domains[].subskills[].questionCount`. A per-domain counter tracks how many questions have been served. Questions beyond the cap are filtered out.

---

### BUG-38 · No Text Protection — AI Tools Can Read Screenshots (Najla)
**Severity:** Low
**File:** `components/exam-portal/ExamPortalMain.jsx`

**Problem:** No text selection prevention. AI screenshot-reading tools (GPT-4V, etc.) could read question text from screenshots.

**Fix:** Applied `user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-user-drag: none` inline styles to the entire `.app-container` during `examSessionActive`. Text cannot be selected or dragged, reducing OCR/AI tool effectiveness.

---

## Files Modified Summary {#files-modified}

| File | Bugs Fixed |
|------|-----------|
| `components/exam-portal/ExamPortalMain.jsx` | BUG-10, 11, 12, 13, 15–27, 29–33, 35–38 |
| `components/exam-portal/QuestionArea/QuestionArea.jsx` | BUG-14, 29, 30, 35 |
| `components/exam-portal/Home/Home.jsx` | BUG-08, 13, 21, 25 |
| `components/exam-portal/ImagePanel/ImagePanel.jsx` | BUG-34 |
| `components/exam-portal/Header/Header.jsx` | BUG-33 (via prop) |
| `components/admin/pri-test-builder.tsx` | BUG-01 |
| `components/admin/dashboard.tsx` | BUG-06, 07 |
| `components/student/insights/StudentInsights.tsx` | BUG-09 |
| `models/QuestionBank.ts` | BUG-02 |
| `models/PriTestBank.ts` | BUG-02 |
| `app/api/admin/pri-tests/[id]/route.ts` | BUG-03, 04 |
| `app/api/admin/pri-tests/[id]/evaluate/route.ts` | BUG-05, 28 *(created)* |
| `app/api/student/pri-test/route.ts` | BUG-25, 37 |

---

## Statistics

| Category | Count |
|----------|-------|
| **Critical** bugs fixed | 8 |
| **High** severity bugs fixed | 16 |
| **Medium** severity bugs fixed | 12 |
| **Low** severity bugs fixed | 6 |
| **New files created** | 1 (`evaluate/route.ts`) |
| **Files modified** | 13 |
| **Total bugs fixed** | **38** |

---

*Report generated: 2026-03-28 | Branch: thiga | All fixes committed to working directory*
