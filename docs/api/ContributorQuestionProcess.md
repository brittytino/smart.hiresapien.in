# Contributor Question Process

## Overview
Contributor questions move through two collections:
- Staging: contributor_questions (ContributorQuestion)
- Approved: questions (Question)

The staging record is created by contributors and reviewed by admins. If approved, the record is copied into the main questions collection.

## Flow Steps

1) Contributor submits a question
- UI: contributor portal question form
- API: POST /api/questions
- Stored in: contributor_questions
- Status: pending
- uniqueId auto-generated as domain_subskill_questionid

2) Admin reviews the submission
- API: PUT /api/admin/questions/[id]/review
- action: approve or reject

If approved:
- The staging record is copied into questions with status approved
- The staging record is updated to status approved
- Duplicate approval is blocked if the approved record already exists

If rejected:
- The staging record is updated to status rejected
- reviewNote is required

## Key Fields Saved

Staging (ContributorQuestion)
- uniqueId
- domain, subSkill, assessmentType
- bloomLevel
- questionType, questionText, questionImageUrl
- caseContext, caseContextImageUrl
- options, correctAnswer
- explanation, explanationImageUrl
- difficulty
- estimatedTimeMinutes
- contributorId, contributorUsername
- status, reviewNote, reviewedAt, reviewedBy
- createdAt, updatedAt

Approved (Question)
- uniqueId
- domain, subSkill, assessmentType
- bloomLevel
- questionType, questionText, questionImageUrl
- caseContext, caseContextImageUrl
- options, correctAnswer
- explanation, explanationImageUrl
- difficulty
- estimatedTimeMinutes
- contributorId, contributorUsername
- status, reviewNote, reviewedAt, reviewedBy
- createdAt, updatedAt

## Status Lifecycle
- pending: created by contributor
- approved: copied to main questions collection
- rejected: not copied; requires reviewNote

## Duplicate Approval Guard
- If staging status is already approved, approval is blocked
- If a questions record exists with the same uniqueId, approval is blocked

## Related Files
- models/ContributorQuestion.ts
- models/Question.ts
- app/api/questions/route.ts
- app/api/admin/questions/[id]/review/route.ts
