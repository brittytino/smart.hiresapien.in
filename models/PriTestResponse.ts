import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PriTestResponseStatus = 'in_progress' | 'submitted' | 'closed';
export type PriTestEvaluationStatus = 'pending' | 'reviewed';

export type PriTestAnswerEvaluationStatus = 'pending' | 'auto';

export interface IPriTestAnswerAIEvaluation {
  scores: {
    task_completion: number;
    clarity_and_brevity: number;
    logical_structure: number;
    professional_tone: number;
    critical_thinking: number;
  };
  feedback: string;
  averageScore: number;
  evaluatedAt: Date;
}

export interface IPriTestResponseAnswer {
  questionIndex: number;
  questionId?: string;
  questionType: 'mcq' | 'written';
  domainId: string;
  subSkill?: string;
  selectedOption?: string;
  answerText?: string;
  studentAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  timeTakenSeconds?: number;
  evaluationStatus?: PriTestAnswerEvaluationStatus;
  needsAttention?: boolean;
  attentionReason?: string;
  aiEvaluation?: IPriTestAnswerAIEvaluation;
}

/** Per-domain timing record — one entry per domain the student interacted with */
export interface IPriTestDomainTiming {
  domainId: string;
  domainName?: string;
  /** HH:MM scheduled start from test bank (e.g. "09:00") */
  scheduledStartTime?: string;
  /** HH:MM scheduled end from test bank (e.g. "09:45") */
  scheduledEndTime?: string;
  /** Scheduled slot duration in seconds */
  scheduledDurationSeconds?: number;
  /** When the student navigated into the domain */
  enteredAt?: Date;
  /** When the domain was submitted or timed out */
  submittedAt?: Date;
  /** Actual time the student spent in the domain (seconds) */
  timeSpentSeconds?: number;
  /** How the domain ended */
  status?: 'submitted' | 'timeout' | 'terminated';
  /** Number of questions answered in this domain */
  answeredCount?: number;
  /** Total questions assigned to this domain */
  totalQuestions?: number;
}

/** One entry per proctoring violation */
export interface IPriTestWarningEvent {
  timestamp: Date;
  reason?: string;
}

export interface IPriTestResponse extends Document {
  responseCode?: string;
  questionBankId: Types.ObjectId;
  bankTitle?: string;
  studentUserId: Types.ObjectId;
  studentId?: string;
  studentName?: string;
  studentUsername?: string;
  batch?: string;
  programme?: string;
  examDate?: Date;
  institutionId: Types.ObjectId;
  status: PriTestResponseStatus;
  evaluationStatus: PriTestEvaluationStatus;
  answers: IPriTestResponseAnswer[];
  currentDomainId?: string;
  currentQuestionIndex?: number;
  questionShuffleOrder?: number[];
  optionShuffleMaps?: Map<string, string[]>;
  warningCount?: number;
  /** Timestamped log of every proctoring warning */
  warningEvents?: IPriTestWarningEvent[];
  submittedDomains?: string[];
  terminatedDomains?: string[];
  /** Per-domain timing breakdown */
  domainTimings?: IPriTestDomainTiming[];
  startedAt: Date;
  lastActiveAt: Date;
  submittedAt?: Date;
  /** Total test duration in seconds (submittedAt − startedAt) */
  testDurationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PriTestResponseAnswerSchema = new Schema<IPriTestResponseAnswer>(
  {
    questionIndex: { type: Number, required: true, min: 0 },
    questionId: { type: String, maxlength: 80 },
    questionType: { type: String, required: true, enum: ['mcq', 'written'] },
    domainId: { type: String, required: true },
    subSkill: { type: String, maxlength: 200 },
    selectedOption: { type: String, maxlength: 2 },
    answerText: { type: String, maxlength: 5000 },
    studentAnswer: { type: String, maxlength: 5000 },
    correctAnswer: { type: String, maxlength: 2 },
    isCorrect: { type: Boolean },
    timeTakenSeconds: { type: Number, min: 0 },
    evaluationStatus: { type: String, enum: ['pending', 'auto'], default: 'pending' },
    needsAttention: { type: Boolean, default: false },
    attentionReason: { type: String, maxlength: 300 },
    aiEvaluation: {
      scores: {
        task_completion: Number,
        clarity_and_brevity: Number,
        logical_structure: Number,
        professional_tone: Number,
        critical_thinking: Number,
      },
      feedback: String,
      averageScore: Number,
      evaluatedAt: { type: Date, default: Date.now },
    },
  },
  { _id: false }
);

const PriTestDomainTimingSchema = new Schema<IPriTestDomainTiming>(
  {
    domainId: { type: String, required: true },
    domainName: { type: String, maxlength: 200 },
    scheduledStartTime: { type: String, maxlength: 10 },
    scheduledEndTime: { type: String, maxlength: 10 },
    scheduledDurationSeconds: { type: Number, min: 0 },
    enteredAt: { type: Date },
    submittedAt: { type: Date },
    timeSpentSeconds: { type: Number, min: 0 },
    status: { type: String, enum: ['submitted', 'timeout', 'terminated'] },
    answeredCount: { type: Number, min: 0, default: 0 },
    totalQuestions: { type: Number, min: 0 },
  },
  { _id: false }
);

const PriTestWarningEventSchema = new Schema<IPriTestWarningEvent>(
  {
    timestamp: { type: Date, required: true, default: Date.now },
    reason: { type: String, maxlength: 300 },
  },
  { _id: false }
);

const PriTestResponseSchema = new Schema<IPriTestResponse>(
  {
    responseCode: { type: String, maxlength: 80, index: true },
    questionBankId: { type: Schema.Types.ObjectId, ref: 'PriTestBank', required: true, index: true },
    bankTitle: { type: String, maxlength: 200 },
    studentUserId: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true, index: true },
    studentId: { type: String, maxlength: 80 },
    studentName: { type: String, maxlength: 120 },
    studentUsername: { type: String, maxlength: 120 },
    batch: { type: String, maxlength: 80 },
    programme: { type: String, maxlength: 120 },
    examDate: { type: Date },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    status: { type: String, enum: ['in_progress', 'submitted', 'closed'], default: 'in_progress', index: true },
    evaluationStatus: { type: String, enum: ['pending', 'reviewed'], default: 'pending', index: true },
    answers: { type: [PriTestResponseAnswerSchema], default: [] },
    currentDomainId: { type: String, maxlength: 100 },
    currentQuestionIndex: { type: Number, min: 0 },
    questionShuffleOrder: { type: [Number] },
    optionShuffleMaps: { type: Map, of: [String] },
    warningCount: { type: Number, default: 0, min: 0 },
    warningEvents: { type: [PriTestWarningEventSchema], default: [] },
    submittedDomains: { type: [String], default: [] },
    terminatedDomains: { type: [String], default: [] },
    domainTimings: { type: [PriTestDomainTimingSchema], default: [] },
    startedAt: { type: Date, required: true, default: Date.now },
    lastActiveAt: { type: Date, required: true, default: Date.now },
    submittedAt: { type: Date },
    testDurationSeconds: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    collection: 'students_pri_test_response',
  }
);

PriTestResponseSchema.index({ questionBankId: 1, studentUserId: 1, institutionId: 1, status: 1 });

const PriTestResponse: Model<IPriTestResponse> =
  (mongoose.models.PriTestResponse as Model<IPriTestResponse>) ||
  mongoose.model<IPriTestResponse>('PriTestResponse', PriTestResponseSchema);

export default PriTestResponse;
