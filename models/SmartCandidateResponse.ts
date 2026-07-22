import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISmartQuestionResponse {
  domainId: string;
  questionId: string;
  questionType: 'mcq' | 'maq' | 'touchboard' | 'oral';
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  studentAnswer: any; // Can be string, string[], {x: number, y: number}, or speech-to-text string
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface ISmartCandidateResponse extends Document {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  status: 'in_progress' | 'submitted';
  startedAt: Date;
  submittedAt?: Date;
  totalDurationSeconds?: number;
  answers: ISmartQuestionResponse[];
  smartScore?: number;
  competencyScores?: Map<string, number>;
  benchmarkPercentile?: number;
  readinessLevel?: string;
  learningRecommendations?: string[];
  skillGapAnalysis?: Array<{ domain: string; score: number; benchmark: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const SmartQuestionResponseSchema = new Schema<ISmartQuestionResponse>(
  {
    domainId: { type: String, required: true },
    questionId: { type: String, required: true },
    questionType: { type: String, required: true, enum: ['mcq', 'maq', 'touchboard', 'oral'] },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
    questionText: { type: String, required: true },
    studentAnswer: { type: Schema.Types.Mixed },
    isCorrect: { type: Boolean, required: true },
    timeSpentSeconds: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SmartCandidateResponseSchema = new Schema<ISmartCandidateResponse>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 10 },
    gender: { type: String, required: true },
    status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress', index: true },
    startedAt: { type: Date, default: Date.now, required: true },
    submittedAt: { type: Date },
    totalDurationSeconds: { type: Number },
    answers: { type: [SmartQuestionResponseSchema], default: [] },
    smartScore: { type: Number },
    competencyScores: { type: Map, of: Number },
    benchmarkPercentile: { type: Number },
    readinessLevel: { type: String },
    learningRecommendations: { type: [String], default: [] },
    skillGapAnalysis: {
      type: [
        new Schema(
          {
            domain: String,
            score: Number,
            benchmark: Number,
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'smart_candidate_responses',
  }
);

// Indexes for admin reporting
SmartCandidateResponseSchema.index({ email: 1 });
SmartCandidateResponseSchema.index({ createdAt: -1 });

const SmartCandidateResponse: Model<ISmartCandidateResponse> =
  (mongoose.models.SmartCandidateResponse as Model<ISmartCandidateResponse>) ||
  mongoose.model<ISmartCandidateResponse>('SmartCandidateResponse', SmartCandidateResponseSchema);

export default SmartCandidateResponse;
