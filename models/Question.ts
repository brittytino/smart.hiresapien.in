import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { DOMAINS } from '@/lib/domains';

const DOMAIN_IDS = DOMAINS.map((d) => d.id);

export interface IQuestionOption {
  label: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
  imageUrl?: string;
  score?: number;
}

export interface IQuestion extends Document {
  uniqueId: string;
  domain: string;
  subSkill: string;
  assessmentType: string;
  bloomLevel?: 'Remember' | 'Understand' | 'Apply' | 'Analyse' | 'Create' | 'Evaluate';
  questionType: 'mcq' | 'written';
  questionText: string;
  questionImageUrl?: string;
  /** Optional narrative/case context shown before the question */
  caseContext?: string;
  caseContextImageUrl?: string;
  options: IQuestionOption[];
  /** Correct option label (A/B/C/D). Omitted for Ipsative Psychometric */
  correctAnswer?: string;
  /** Explanation shown after the assessment */
  explanation?: string;
  explanationImageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeMinutes: number;
  contributorId: Types.ObjectId;
  contributorUsername: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<IQuestionOption>(
  {
    label: { type: String, required: true, maxlength: 2 },
    text: { type: String, required: true, maxlength: 2000 },
    imageUrl: { type: String, maxlength: 2000 },
    score: { type: Number, min: -1, max: 1 },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    uniqueId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      enum: { values: DOMAIN_IDS, message: 'Invalid domain' },
      index: true,
    },
    subSkill: {
      type: String,
      required: [true, 'Subskill is required'],
      maxlength: [200, 'Subskill cannot exceed 200 characters'],
    },
    assessmentType: {
      type: String,
      required: [true, 'Assessment type is required'],
    },
    bloomLevel: {
      type: String,
      required: function (this: any) {
        return (this as any).domain !== 'workspace-psychology';
      },
      enum: ['Remember', 'Understand', 'Apply', 'Analyse', 'Create', 'Evaluate'],
    },
    questionType: {
      type: String,
      required: [true, 'Question type is required'],
      enum: ['mcq', 'written'],
      index: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      minlength: [10, 'Question must be at least 10 characters'],
      maxlength: [5000, 'Question cannot exceed 5000 characters'],
    },
    questionImageUrl: {
      type: String,
      maxlength: [2000, 'Question image URL cannot exceed 2000 characters'],
    },
    caseContext: {
      type: String,
      maxlength: [5000, 'Case context cannot exceed 5000 characters'],
    },
    caseContextImageUrl: {
      type: String,
      maxlength: [2000, 'Case context image URL cannot exceed 2000 characters'],
    },
    options: {
      type: [OptionSchema],
      validate: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validator: function (this: any, opts: IQuestionOption[]) {
          if (this.questionType === 'written') {
            return opts.length === 0;
          }
          return opts.length >= 2 && opts.length <= 5;
        },
        message: 'Options must contain between 2 and 5 items for MCQ questions',
      },
      default: [],
    },
    correctAnswer: {
      type: String,
      maxlength: 2,
      required: function (this: any) {
        return (this as any).questionType === 'mcq' && (this as any).domain !== 'workspace-psychology';
      },
    },
    explanation: {
      type: String,
      maxlength: [2000, 'Explanation cannot exceed 2000 characters'],
    },
    explanationImageUrl: {
      type: String,
      maxlength: [2000, 'Explanation image URL cannot exceed 2000 characters'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    estimatedTimeMinutes: {
      type: Number,
      required: [true, 'Estimated time is required'],
      min: [0.1, 'Estimated time must be at least 0.1 minutes'],
      max: [240, 'Estimated time cannot exceed 240 minutes'],
    },
    contributorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Contributor',
      index: true,
    },
    contributorUsername: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewNote: { type: String, maxlength: 1000 },
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
  },
  {
    timestamps: true,
    collection: 'questions',
  }
);

const Question: Model<IQuestion> =
  (mongoose.models.Question as Model<IQuestion>) ||
  mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
