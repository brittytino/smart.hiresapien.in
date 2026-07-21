# Evaluation Process Engine

This document provides a detailed and straightforward explanation of how the Multiple Choice Question (MCQ) evaluation engine works under the hood. It follows a structured, step-by-step process to fetch, analyze, and score user responses against a predefined question bank.

## Overview
The evaluation engine operates in two main phases:
1. **Data Orchestration (Runner Script)**: Identifying pending test responses and saving the computed scores.
2. **Core Evaluation Logic**: Analyzing user answers computationally to determine correctness, subskill performance, and the final score.

---

## 1. Data Orchestration (`scripts/evaluate-mcq.ts`)

The runner acts as the controller for processing test submissions. It can be run broadly or for a specific student response using the `--responseId` flag.

### Process Flow:
- **Fetch Pending Responses**: It queries the database for any test responses marked as `submitted` but still `pending` for evaluation.
- **Retrieve Question Bank**: For each pending response, the respective Question Bank containing the accurate answers and blueprint structures (domains and subskills) is pulled.
- **Trigger Core Evaluation**: Passes the response and question bank to the core evaluation module.
- **Save Evaluation Results**:
  - The calculated results (total correct, total score, percentage, domain breakdowns) are stored in the `PriTestEvaluation` collection.
  - The status in `PriTestEvaluation` is set to `completed`.
- **Update Overall Status**: 
  - If the test contained written questions (which require manual intervention), the response's evaluation status stays `pending`. 
  - If the test consisted entirely of MCQs, the status is safely marked as `reviewed`.

---

## 2. Core Evaluation Logic (`evaluation/pri-test-mcq.ts`)

This is where the actual validation and scoring occur. The logic evaluates the student's choices against the question bank to calculate an accurate numerical and domain-specific assessment.

### Step 1: Mapping the Question Bank
The system maps out the structure of the question bank by counting the total available questions and categorizing them using unique keys grouping their specific **Domain** and **Subskill**.

### Step 2: Validating Student Answers
The system iterates through the submitted student answers to verify their accuracy:
- It checks if the question is an MCQ.
- It identifies if an answer is correct either by a preset boolean flags (`isCorrect`) or by checking if the student's `selectedOption` perfectly matches the `correctAnswer`.
- It keeps a running tally of total correct answers globally and per subskill.

### Step 3: Domain & Subskill Scoring (Mathematical Breakdown)

The calculations are strictly deterministic and are based on the weight (`priContribution`) assigned to each subskill within the test blueprint:

1. **Subskill Success Ratio**: First, calculate the fraction of correctly answered questions for a specific subskill.
   `Ratio = (Correct Questions in Subskill) / (Total Questions in Subskill)`

2. **Subskill Score**: Multiply this ratio by the subskill's predefined allocation weight. The outcome is rounded down to two decimal places.
   `Subskill Score = Round[ (Ratio) × (Subskill Contribution Value), 2 ]`

3. **Domain Score**: A Domain acts as a container for its subskills. Its score is calculated by summing up the newly calculated subskill scores.
   `Domain Score = Round[ Σ (All Subskill Scores within the Domain), 2 ]`

### Step 4: Final Calculations

With the individual Domain limits calculated, the script aggregates these into the final numeric metrics:

- **Total Overall Score**: The sum of all domain scores across the entire test.
  `Total Score = Round[ Σ (All Domain Scores), 2 ]`

- **Percentage Output**: Because the combined subskill contribution weights natively sum up to a maximum 100 points, the accumulated total score maps straight to the percentage equivalent.
  `Percentage = Total Score`

- **Data Packaging**: Bundles the `totalScore`, `percentage`, `mcqCorrect`, `mcqTotal`, and detailed `domains` array, returning this directly to the runner script for database insertion.

---

## 3. Comprehensive Workflow Example

To clearly observe these formulas working in practice, consider this theoretical mock test with exactly 10 questions to solve:

### The Blueprint Context (Question Bank)
The test is organized precisely into two main Domains and mapped to a 100-point total weight:

- **Domain 1: Logic & Analytics**
  - **Subskill A (Spreadsheets)**: Has **4 test questions** mapped to an allocated weight of **30 points** (`priContribution: 30`).
  - **Subskill B (SQL Analysis)**: Has **2 test questions** mapped to an allocated weight of **20 points** (`priContribution: 20`).
- **Domain 2: Business Ethics**
  - **Subskill X (Deduction)**: Has **4 test questions** mapped to an allocated weight of **50 points** (`priContribution: 50`).

### The Student's Final Response Accuracy
After the engine completes **Step 2 (Validation)**, these are the student's tallied correct vs. total answers:
- **Subskill A (Spreadsheets)**: 3 out of 4 correct
- **Subskill B (SQL Analysis)**: 1 out of 2 correct
- **Subskill X (Deduction)**: 4 out of 4 correct

---

### Mathematics In Motion (The Step-by-Step Scoring)

#### Calculating Domain 1
1. **Scoring Subskill A (Spreadsheets)**:
   - Success Ratio = `3 / 4` = `0.75`
   - Weighted Score = `Round (0.75 * 30 points, 2)` = **22.50 points acquired**
2. **Scoring Subskill B (SQL Analysis)**:
   - Success Ratio = `1 / 2` = `0.50`
   - Weighted Score = `Round (0.50 * 20 points, 2)` = **10.00 points acquired**
3. **Closing Domain 1**:
   - Total Domain Score = `Round (22.50 + 10.00, 2)` = **32.50 points acquired for Logic & Analytics**

#### Calculating Domain 2
1. **Scoring Subskill X (Deduction)**:
   - Success Ratio = `4 / 4` = `1.00`
   - Weighted Score = `Round (1.00 * 50 points, 2)` = **50.00 points acquired**
2. **Closing Domain 2**:
   - Total Domain Score = **50.00 points acquired for Business Ethics**

#### Final Engine Aggregation 
Once domains lock in, the system finalizes metrics to write to the `PriTestEvaluation` collection:
- **Total Correct MCQs**: `3 + 1 + 4` = **8 MCQs Correct**
- **Total Expected MCQs**: `4 + 2 + 4` = **10 MCQs Total**
- **Final Combined Score**: `32.50 (Domain 1) + 50.00 (Domain 2)` = **82.50 Overall Score**
- **Final Percentage Equivalent**: **82.50%**
