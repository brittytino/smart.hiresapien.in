import mongoose, { Document, Model, Schema, Types } from 'mongoose';

/** Aggregated per-domain stats — one entry per domain the student attempted */
export interface IStudentDomainSummary {
  domainId: string;
  domainName?: string;
  /** Total seconds the student spent inside this domain */
  timeSpentSeconds: number;
  /** Number of questions answered */
  answeredCount: number;
  /** Number of correct answers (populated after evaluation) */
  correctCount?: number;
  /** Total questions assigned to this domain */
  totalQuestions?: number;
  /** When student entered the domain */
  enteredAt?: Date;
  /** When the domain was submitted/timed out */
  submittedAt?: Date;
  /** Scheduled slot start (HH:MM) */
  scheduledStartTime?: string;
  /** Scheduled slot end (HH:MM) */
  scheduledEndTime?: string;
  /** Scheduled slot duration in seconds */
  scheduledDurationSeconds?: number;
}

export interface IStudentResponse extends Document {
  studentUserId: Types.ObjectId;
  testBankId: Types.ObjectId;
  institutionId: Types.ObjectId;
  studentId?: string;
  studentName?: string;
  studentUsername?: string;
  responses: {
    questionIndex: number;
    questionId?: string;
    domainId: string;
    subSkill?: string;
    difficulty?: string;
    selectedOption: string;
    timeTakenSeconds: number;
    isCorrect?: boolean;
    timestamp: Date;
  }[];
  totalTimeTakenSeconds: number;
  /** Per-domain aggregated timing and performance */
  domainSummaries: IStudentDomainSummary[];
  /** Copy of PriTestResponse.startedAt — when student began the test */
  testStartedAt?: Date;
  /** Copy of PriTestResponse.submittedAt — when the final test was submitted */
  testSubmittedAt?: Date;
  /** Total test wall-clock duration in seconds (testSubmittedAt − testStartedAt) */
  testDurationSeconds?: number;
  status: 'in_progress' | 'completed' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const StudentDomainSummarySchema = new Schema<IStudentDomainSummary>(
  {
    domainId: { type: String, required: true },
    domainName: { type: String, maxlength: 200 },
    timeSpentSeconds: { type: Number, default: 0, min: 0 },
    answeredCount: { type: Number, default: 0, min: 0 },
    correctCount: { type: Number, min: 0 },
    totalQuestions: { type: Number, min: 0 },
    enteredAt: { type: Date },
    submittedAt: { type: Date },
    scheduledStartTime: { type: String, maxlength: 10 },
    scheduledEndTime: { type: String, maxlength: 10 },
    scheduledDurationSeconds: { type: Number, min: 0 },
  },
  { _id: false }
);

const StudentResponseSchema = new Schema<IStudentResponse>(
  {
    studentUserId: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true, index: true },
    testBankId: { type: Schema.Types.ObjectId, ref: 'PriTestBank', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    studentId: { type: String },
    studentName: { type: String },
    studentUsername: { type: String },
    responses: [
      {
        questionIndex: { type: Number, required: true },
        questionId: { type: String },
        domainId: { type: String, required: true },
        subSkill: { type: String },
        difficulty: { type: String },
        selectedOption: { type: String, required: true },
        timeTakenSeconds: { type: Number, default: 0 },
        isCorrect: { type: Boolean },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    totalTimeTakenSeconds: { type: Number, default: 0 },
    domainSummaries: { type: [StudentDomainSummarySchema], default: [] },
    testStartedAt: { type: Date },
    testSubmittedAt: { type: Date },
    testDurationSeconds: { type: Number, min: 0 },
    status: { type: String, enum: ['in_progress', 'completed', 'closed'], default: 'in_progress' },
  },
  { timestamps: true, collection: 'student_responses' }
);

StudentResponseSchema.index({ studentUserId: 1, testBankId: 1 });

const StudentResponse: Model<IStudentResponse> =
  (mongoose.models.StudentResponse as Model<IStudentResponse>) ||
  mongoose.model<IStudentResponse>('StudentResponse', StudentResponseSchema);

export default StudentResponse;
