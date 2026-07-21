import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PsychometricTestStatus = 'in_progress' | 'submitted' | 'terminated';

export interface IPsychometricResult extends Document {
  studentUserId: Types.ObjectId;
  institutionId: Types.ObjectId;
  studentId?: string;
  studentName?: string;
  studentUsername?: string;
  scores: Record<string, number>; // traitId -> score
  traitResults?: Record<string, {
    score: number;
    maxScore: number;
    passed: boolean;
  }>;
  overallStatus: 'pass' | 'fail' | 'pending';
  passedTraitsCount: number;
  aiAnalysis?: string;
  questionBankId?: Types.ObjectId;
  status: PsychometricTestStatus;
  violationCount: number;
  startedAt: Date;
  submittedAt?: Date;
}

const PsychometricResultSchema = new Schema<IPsychometricResult>(
  {
    studentUserId: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      index: true,
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    questionBankId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionBank',
      index: true,
    },
    studentId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    studentName: {
      type: String,
    },
    studentUsername: {
      type: String,
    },
    scores: {
      type: Map,
      of: Number,
      default: {},
    },
    traitResults: {
      type: Map,
      of: {
        score: Number,
        maxScore: Number,
        passed: Boolean,
      },
    },
    overallStatus: {
      type: String,
      enum: ['pass', 'fail', 'pending'],
      default: 'pending',
      index: true,
    },
    passedTraitsCount: {
      type: Number,
      default: 0,
    },
    aiAnalysis: {
      type: String,
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'terminated'],
      default: 'in_progress',
      index: true,
    },
    violationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'psychometric_results',
  }
);

// Compound index for quick lookups
PsychometricResultSchema.index({ studentUserId: 1, institutionId: 1 });

const PsychometricResult: Model<IPsychometricResult> =
  (mongoose.models.PsychometricResult as Model<IPsychometricResult>) ||
  mongoose.model<IPsychometricResult>('PsychometricResult', PsychometricResultSchema);

export default PsychometricResult;
