# Psychometric Engine Documentation

## Overview
The Psychometric Engine is a professional-grade competency assessment framework designed to evaluate behavioral traits and workplace readiness. It provides a structured, proctored environment for students to demonstrate their decision-making capabilities across five core dimensions of professional effectiveness.

## Core Behavioral Traits
The assessment evaluates 25 questions distributed across five distinct traits, each critical for success in a modern corporate environment:

1.  **Stress Resilience & Pressure Management**: Ability to maintain focus and prioritize tasks under intense deadlines and critical feedback.
2.  **Grit & Initiative**: Degree of persistence in long-term goals and willingness to take proactive steps beyond assigned responsibilities.
3.  **Professionalism & Workplace Etiquette**: Adherence to organizational standards, confidentiality, and commitment to delivery.
4.  **Cultural Adaptability & Team Fit**: Flexibility in collaborating with diverse teams and adapting to different organizational norms.
5.  **Accountability & Self-Awareness**: Capacity for realistic self-assessment and taking ownership of both successes and failures.
6.  **Trait Navigation Bar (Tabs)**: High-visibility tabs at the top of the question area allow for direct switching between traits.
7.  **Dynamic Transitions**: When moving between traits, the navigation button explicitly labels the transition as **"Next Trait →"**.
8.  **Configurable Counts**: Administrators can define the number of questions per trait (defaulting to 5).

## Tactical Implementation

### Proctoring & Security
To ensure the integrity of the assessment, the engine implements a strict proctoring layer:
- **Environment Lock**: The assessment requires Full-Screen Mode to be active at all times.
- **Violation Monitoring**: The engine monitors for window-blur events and exit-fullscreen actions.
- **Automated Termination**: A violation counter tracks unauthorized exits. Upon the third violation, the assessment session is automatically terminated and marked accordingly in the database.

### Progressive Timing
- **Progressive Timing**: Each question has a 30-second window.
- **Auto-Progression**: If a response is not recorded within the time limit, the engine automatically proceeds to the next question.
- **Performance Penalty**: Questions that time out or are explicitly skipped are assigned a score of -1.0.

### Scoring Logic
- **Granular Weighting**: Every option is assigned a specific score ranging from -1.0 (Counter-productive behavior) to +1.0 (Optimal professional behavior).
- **Trait Aggregation**: Scores are aggregated per trait to provide a holistic view of the candidate's profile.
- **Pass Threshold**: A benchmark of 2.5 per trait is established as the standard for proficiency.

## Technical Architecture

### Data Models
- **PsychometricTestAssignment**: Manages the deployment of tests to institutions, defining the active window (Start and End dates).
- **PsychometricResult**: Records the granular scores, proctoring violations, timestamps, and the final completion status.

### API Integration
- **`POST /api/student/psychometric/submit`**: Handles the final submission, performs institutional verification, and updates the persistence layer.
- **Authentication**: Secured via JWT-based authorization, ensuring records are accurately linked to verified student profiles.

### Visual Analytics
The results are presented through a high-fidelity dashboard incorporating:
- **Radial Competency Mapping**: A Radar Chart visualizing the student's trait profile against theoretical maximums.
- **Comparative Metrics**: Visual indicators comparing raw scores against the 2.5 proficiency benchmark.
- **Longitudinal Tracking**: Dates for session initiation and submission are recorded for administrative audit trails.

## Deployment Workflow
1.  **Administrative Assignment**: Institution admins accept the test module and set the deployment window.
2.  **Student Initiation**: Students access the landing page, review instructions, and enter the proctored environment.
3.  **Session Execution**: The `TestRunner` component manages state, timing, and proctoring.
4.  **Data Persistence**: Results are securely transmitted and stored upon completion or termination.
5.  **Analytics Review**: Immediate feedback is provided to the student, while admins can access institution-wide performance reports.
