# PRI Test — Response Storage & MCA Evaluation Engine Audit

---

## 1. Where Responses Are Saved

### Model: `PriTestResponse`
Collection: `students_pri_test_response`  
File: [models/PriTestResponse.ts](../models/PriTestResponse.ts)

### Two Save Paths

| Path | File | When | Merge Strategy |
|------|------|------|----------------|
| **Main POST** `/api/student/pri-test` | [app/api/student/pri-test/route.ts](../app/api/student/pri-test/route.ts) | On every answer select / next / clear / mark-as-read in ExamPortalMain | Per-question merge (Map by questionIndex) — safe |
| **Submit POST** `/api/student/pri-test/submit` | [app/api/student/pri-test/submit/route.ts](../app/api/student/pri-test/submit/route.ts) | Final submit from dashboard.tsx | Merges with existing DB answers (fixed) — safe |

---

## 2. What Is Saved Per Answer

Every entry in `PriTestResponse.answers[]` stores:

| Field | Source | Notes |
|-------|--------|-------|
| `questionIndex` | question position in bank | Key used to look up question during evaluation |
| `questionId` | `"${bankId}:${index}"` | Composite ID; unused by evaluator |
| `questionType` | `'mcq'` or `'written'` | Evaluator filters — only processes `'mcq'` |
| `domainId` | from question bank | Used to group scores by domain |
| `subSkill` | from question bank | Used to group scores by sub-skill |
| `selectedOption` | student's chosen label (e.g. `'A'`) | **Core evaluation field — compared to correctAnswer** |
| `answerText` | student's typed text (written only) | Not scored automatically — requires manual review |
| `studentAnswer` | copy of `selectedOption` or `answerText` | Redundant duplicate; evaluator ignores it |
| `correctAnswer` | copied from bank at save time | Used as fallback by evaluator |
| `isCorrect` | pre-computed at save time | **Stored but re-calculated at evaluation — not trusted** |
| `timeTakenSeconds` | seconds spent on question | Stored; not used in scoring |
| `evaluationStatus` | `'auto'` (MCQ) or `'pending'` (written) | Stored; evaluator ignores it |
| `needsAttention` | `false` (MCQ) or `true` (written) | Stored; evaluator ignores it |

---

## 3. Evaluation Engine — How It Fetches & Uses Responses

### Entry Point
Admin triggers: `POST /api/admin/pri-tests/:id/evaluate`  
File: [app/api/admin/pri-tests/[id]/evaluate/route.ts](../app/api/admin/pri-tests/%5Bid%5D/evaluate/route.ts)

### Fetch Query
```typescript
PriTestResponse.find({ questionBankId: bankId, status: 'submitted' })
```
Only processes responses with `status: 'submitted'`. In-progress responses are skipped.

### MCQ Scoring Loop (lines 72–107)
```
for each answer in response.answers:
  skip if questionType !== 'mcq'
  skip if domainId === 'workspace-psychology'   ← psychometric domain evaluated separately
  look up question from bank by questionIndex
  compare answer.selectedOption === question.correctAnswer
  bucket results by domainId → subSkill
```

### Scoring Formula
```
subskillScore   = (correctInSubskill / totalInBank) × subskill.priContribution
domainScore     = SUM of all subskillScores in domain
totalScore      = SUM of all domainScores  (capped at 100)
```

### Output — Stored in `PriTestEvaluation`
Collection: `pri_test_evaluations`  
File: [models/PriTestEvaluation.ts](../models/PriTestEvaluation.ts)

| Field | Meaning |
|-------|---------|
| `responseId` | Reference to PriTestResponse |
| `mcqCorrect` | Total correct MCQ answers |
| `mcqTotal` | Total MCQ questions in bank |
| `totalScore` | Weighted PRI score (0–100) |
| `percentage` | Same as totalScore |
| `domains[]` | Per-domain breakdown |
| `domains[].subskills[]` | Per-subskill breakdown |
| `domains[].correct` | Correct answers in domain |
| `domains[].total` | Total questions in domain (from bank) |
| `domains[].score` | Weighted domain score |

---

## 4. Field-by-Field: Saved vs Used by Evaluator

| Field | Saved | Used by Evaluator | Notes |
|-------|:-----:|:-----------------:|-------|
| `questionIndex` | ✅ | ✅ | Maps to bank question |
| `questionType` | ✅ | ✅ | Filters MCQ only |
| `domainId` | ✅ | ✅ | Groups by domain |
| `subSkill` | ✅ | ✅ | Groups by sub-skill |
| `selectedOption` | ✅ | ✅ | Compared to correctAnswer |
| `correctAnswer` | ✅ | ✅ | Read from bank; stored copy is a fallback |
| `isCorrect` | ✅ | ❌ | Stored but **re-calculated** — not trusted |
| `answerText` | ✅ | ❌ | Written answers; no auto-scoring |
| `studentAnswer` | ✅ | ❌ | Redundant copy of selectedOption |
| `timeTakenSeconds` | ✅ | ❌ | Not used in scoring |
| `evaluationStatus` | ✅ | ❌ | Ignored by evaluator |
| `needsAttention` | ✅ | ❌ | Ignored by evaluator |
| `questionId` | ✅ | ❌ | Never read |

---

## 5. Psychometric Domain (Workspace Psychology)

Handled **separately** inside the same evaluate route (lines 109–186):

- Questions grouped by `subSkill` (trait)
- Each option has a `.score` field (can be negative)
- Default for skipped/not-found option: `-1.0`
- Trait passes if: `traitScore >= maxTraitScore / 2`
- Results stored in `psychometric_results` collection (separate from `PriTestEvaluation`)
- **Excluded from MCQ totals** — does not affect PRI score

---

## 6. Written Questions

- Saved with `evaluationStatus: 'pending'`, `needsAttention: true`
- **Never auto-scored** — evaluation loop skips them (`questionType !== 'mcq'`)
- Require manual faculty review
- Do not contribute to PRI score

---

## 7. Bugs Found

### Bug A — `selectedOption` stored as empty string `''` (Medium)

**File:** [app/api/student/pri-test/submit/route.ts:206](../app/api/student/pri-test/submit/route.ts)

```typescript
// Current (wrong):
selectedOption: answer.selectedOption ?? '',   // undefined → ''

// Evaluator then does:
const isCorrect = !!(correctAnswer && selectedOption && correctAnswer === selectedOption);
// '' is falsy → isCorrect = false even if answer was correct
```

Can happen when an answer object has `timeTakenSeconds` but no `selectedOption` (the normalization step at line 84 converts empty selectedOption to `undefined`, but line 206 converts it back to `''`).

**Fix:**
```typescript
selectedOption: answer.selectedOption || undefined,
```

### Bug B — Two evaluation implementations exist; better one is unused (Medium)

**File:** [evaluation/pri-test-mcq.ts](../evaluation/pri-test-mcq.ts)

`evaluateMcqResponse()` is a well-structured utility that:
- Trusts the stored `isCorrect` field when it's a boolean (avoids re-computation)
- Falls back to `answer.correctAnswer` before `question.correctAnswer`
- Handles edge cases more cleanly

**This function is never imported or called anywhere.** The admin evaluate route has its own inline version that is less robust.

### Bug C — `isCorrect` pre-computed at save but ignored at evaluation (Low)

Two different computations exist that should agree but can diverge:

| Where | Uses |
|-------|------|
| Save time (`submit/route.ts:174`) | `studentAnswer === correctAnswer` |
| Eval time (`evaluate/route.ts:87`) | `selectedOption === correctAnswer` |

`studentAnswer` and `selectedOption` should be identical for MCQs, so in practice they agree — but the stored `isCorrect` is never trusted, making it dead data.

---

## 8. What Is NOT Auto-Scored

| Type | Reason |
|------|--------|
| Written answers (`answerText`) | Skipped by evaluator — need manual review |
| Unanswered questions | No entry in `answers[]` — silently scored 0 |
| Workspace Psychology questions | Ipsative/trait scoring, separate pipeline |

---

## 9. Verdict

| Question | Answer |
|----------|--------|
| Are responses saved with all fields the evaluator needs? | ✅ Yes — `questionIndex`, `domainId`, `subSkill`, `selectedOption`, `questionType` all saved |
| Does the evaluator fetch from the right collection? | ✅ Yes — queries `PriTestResponse` by `status: 'submitted'` |
| Does the evaluator correctly compute scores? | ✅ Yes — formula is correct (uses bank totals, not attempted totals) |
| Is `selectedOption` always reliably non-empty? | ⚠️ Mostly — edge case exists (Bug A) |
| Is the stored `isCorrect` field used? | ❌ No — re-calculated every time |
| Is there a risk of missing answers at evaluation? | ⚠️ Only if student never answered (unanswered = 0) |
| Written answers scored? | ❌ Manual review only |
