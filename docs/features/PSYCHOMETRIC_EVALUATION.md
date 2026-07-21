# Psychometric Assessment Evaluation Logic

This document describes the automated scoring and evaluation framework for the Workspace Psychology assessment (Ipsative Psychometric).

## 1. Traits and Structure
The assessment is structured as an **Iterative Trait flow**. Questions are grouped by their respective behavioral dimensions, ensuring students complete one trait fully before moving to the next.

### Key Structure Features:
- **Trait Navigation Bar (Tabs)**: High-visibility tabs at the top of the question area allow for direct switching between traits.
- **Sequential Progression**: Within a trait, questions are answered in a fixed order.
- **Dynamic Transitions**: When moving between traits, the navigation button explicitly labels the transition as **"Next Trait →"**.
- **Configurable Counts**: Administrators can define the number of questions per trait (defaulting to 5).

1. Stress Resilience & Pressure Management
2. Grit & Initiative
3. Professionalism & Workplace Etiquette
4. Cultural Adaptability & Team Fit
5. Accountability & Self-Awareness

## 2. Scoring Mechanism
Each question is presented as a multiple-choice selection. Options are weighted based on their alignment with professional standards:

- Positive Alignment: +1.0 point
- Neutral Alignment: 0 points
- Negative Alignment: -0.5 to -1.0 points
- Unattended/Skipped: -1.0 point

### Trait Calculation
The score for a single trait is the sum of the points obtained from the five questions within that trait.

## 3. Passing Criteria

### Trait Level Pass
To pass an individual trait, a student must achieve at least 50% of the maximum potential score for that trait. 
- Maximum Trait Score: Weighted by question count (e.g., 5.0 for 5 questions)
- Passing Threshold: 50% of the maximum score
- **Penalty Impact**: Skips and timeouts reduce the total, making it harder to reach the threshold.

### Global Assessment Pass
The overall assessment status is determined by the number of traits passed.
- Total Traits: 5
- Global Pass Requirement: Minimum of 3 out of 5 traits passed

## 4. Data Storage
Results are persisted immediately upon submission in the MongoDB cluster under the following schema:

- **Collection:** psychometric_results
- **Storage Fields:**
    - `overallStatus`: "pass" or "fail"
    - `passedTraitsCount`: number of traits cleared
    - `traitResults`: Detailed breakdown of scores per trait
    - `scores`: Raw trait ID to numeric score mapping
    - `submittedAt`: Timestamp of the evaluation completion
