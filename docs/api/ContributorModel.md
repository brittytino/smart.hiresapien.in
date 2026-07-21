# Contributor Model

Location: models/Contributor.ts
Collection: contributors

## Purpose
Stores contributor accounts that can submit assessment questions and access the contributor portal.

## Document Shape

Required fields
- username (string): Unique login ID. Trimmed. 3-50 chars. Only letters, numbers, and underscores.
- password (string): Hashed password. Minimum 6 chars before hashing.
- isActive (boolean): Whether the account can log in. Defaults to true.

Optional fields
- email (string): Lowercased email address. Must match basic email format.
- displayName (string): Display name shown in UI. Max 100 chars.

System fields
- createdAt (Date): Auto-set by Mongoose timestamps.
- updatedAt (Date): Auto-set by Mongoose timestamps.

## Validation Rules
- username is required, unique, trimmed, 3-50 chars, and must match /^[a-zA-Z0-9_]+$/.
- password is required, minimum 6 chars (validated before hashing).
- email is optional, lowercased, and must match a basic email regex.
- displayName is optional, max 100 chars.

## Security Behavior
- Passwords are hashed before storage in admin create/update routes.
- password is removed from toJSON / toObject by default in the schema transform.

## Relations
- One contributor to many contributor questions.
  - Stored in contributor_questions via contributorId (ObjectId ref: Contributor).
- One contributor to many approved questions.
  - Stored in questions via contributorId (ObjectId ref: Contributor).

## Indexes
- username: unique

## Example Document (sanitized)
{
  "_id": "ObjectId",
  "username": "contributor_1",
  "email": "contributor@example.com",
  "displayName": "Contributor One",
  "isActive": true,
  "createdAt": "2026-03-19T12:00:00.000Z",
  "updatedAt": "2026-03-19T12:00:00.000Z"
}
