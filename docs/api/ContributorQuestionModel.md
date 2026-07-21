# Contributor Question Model

Location: models/ContributorQuestion.ts
Collection: contributor_questions

## Purpose
Stores questions submitted by contributors for admin review before being published.

## Document Shape

Required fields
- uniqueId (string): Computed as domain_subskill_questionid. Indexed and unique.
- domain (string): Domain ID from lib/domains. Indexed.
- subSkill (string): Selected subskill for the domain.
- assessmentType (string): Assessment type string from the domain.
- bloomLevel (string): One of Remember, Understand, Apply, Analyse, Create, Evaluate.
- questionType ("mcq" | "written"): Determines if options/correctAnswer are required. Indexed.
- questionText (string): Main question prompt. 10-5000 chars.
- options (array): MCQ options (2-5). Must be empty for written questions.
- difficulty ("easy" | "medium" | "hard"): Defaults to medium.
- estimatedTimeMinutes (number): Estimated solve time in minutes (0.1-240).
- contributorId (ObjectId): Ref to Contributor. Indexed.
- contributorUsername (string): Snapshot of contributor username.
- status ("pending" | "approved" | "rejected"): Defaults to pending. Indexed.

Optional fields
- questionImageUrl (string): Optional image URL for the question.
- caseContext (string): Optional scenario/case narrative. Up to 5000 chars.
- caseContextImageUrl (string): Optional image URL for the case context.
- correctAnswer (string): Required for mcq only. Option label (A/B/C/D/E).
- explanation (string): Optional explanation for MCQ questions.
- explanationImageUrl (string): Optional explanation image URL.
- reviewNote (string): Admin review notes. Max 1000 chars.
- reviewedAt (Date): Timestamp set when reviewed.
- reviewedBy (string): Admin identifier.

System fields
- createdAt (Date): Auto-set by Mongoose timestamps.
- updatedAt (Date): Auto-set by Mongoose timestamps.

## Option Subdocument
Each option has:
- label (string): Option label (A-E). Max 2 chars.
- text (string): Option text. Max 2000 chars.
- imageUrl (string): Optional image URL for the option.

## Validation Rules
- uniqueId is generated automatically during validation.
- domain must be one of DOMAINS ids.
- bloomLevel must be one of Remember, Understand, Apply, Analyse, Create, Evaluate.
- questionText must be 10-5000 chars.
- options:
  - For mcq: length must be 2-5.
  - For written: must be empty array.
- correctAnswer is required when questionType is "mcq".
- difficulty enum: easy | medium | hard.
- estimatedTimeMinutes must be between 0.1 and 240.

## Relations
- Many contributor_questions to one contributor.
  - contributorId references Contributor.

## Indexes
- uniqueId (unique)
- domain
- questionType
- contributorId
- status

## Example Document (sanitized)
{
  "_id": "ObjectId",
  "uniqueId": "cognitive-intelligence_Logical_reasoning_ObjectId",
  "domain": "cognitive-intelligence",
  "subSkill": "Logical reasoning",
  "assessmentType": "Cognitive Intelligence",
  "bloomLevel": "Understand",
  "questionType": "mcq",
  "questionText": "If all A are B and all B are C, which is true?",
  "caseContext": "A short scenario that frames the question.",
  "options": [
    { "label": "A", "text": "All A are C" },
    { "label": "B", "text": "All C are A" },
    { "label": "C", "text": "No A are C" },
    { "label": "D", "text": "Some C are A" }
  ],
  "correctAnswer": "A",
  "difficulty": "medium",
  "estimatedTimeMinutes": 2.5,
  "contributorId": "ObjectId",
  "contributorUsername": "contributor_1",
  "status": "pending",
  "createdAt": "2026-03-19T12:00:00.000Z",
  "updatedAt": "2026-03-19T12:00:00.000Z"
}
