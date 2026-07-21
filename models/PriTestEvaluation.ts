import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPriTestEvaluationSubskill {
  name: string;
  share: number;
  priContribution: number;
  correct: number;
  attempted: number;
  total: number;
  score: number;
}

export interface IPriTestEvaluationDomain {
  domainId: string;
  domainName: string;
  domainShare: number;
  correct: number;
  attempted: number;
  total: number;
  score: number;
  subskills: IPriTestEvaluationSubskill[];
}

export interface IPriTestEvaluation extends Document {
  responseId: Types.ObjectId;
  batch?: string;
  questionBankId: Types.ObjectId;
  studentUserId: Types.ObjectId;
  institutionId: Types.ObjectId;
  status: 'completed';
  mcqCorrect: number;
  mcqTotal: number;
  totalScore: number;
  percentage: number;
  domains: IPriTestEvaluationDomain[];
  overallStatus: 'pass' | 'fail' | 'pending';
  traitResults?: Record<string, {
    score: number;
    maxScore: number;
    passed: boolean;
  }>;
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // Pipeline fields
  mcqPriScore: number;
  writtenPriScore: number;
  psychometricPriScore: number;
  priGatewayPassed: boolean;
  aiInsights?: Record<string, unknown>;
  solutionKey?: { questionId: string; questionText: string; correctAnswer: string; domain: string; subSkill: string }[];
  insightsFetchedAt?: Date;
}

const PriTestEvaluationSubskillSchema = new Schema<IPriTestEvaluationSubskill>(
  {
    name: { type: String, required: true, maxlength: 200 },
    share: { type: Number, required: true, min: 0, max: 100 },
    priContribution: { type: Number, required: true, min: 0, max: 100 },
    correct: { type: Number, required: true, min: 0 },
    attempted: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    score: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PriTestEvaluationDomainSchema = new Schema<IPriTestEvaluationDomain>(
  {
    domainId: { type: String, required: true },
    domainName: { type: String, required: true },
    domainShare: { type: Number, required: true, min: 0, max: 100 },
    correct: { type: Number, required: true, min: 0 },
    attempted: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    score: { type: Number, required: true, min: 0 },
    subskills: { type: [PriTestEvaluationSubskillSchema], default: [] },
  },
  { _id: false }
);

const PriTestEvaluationSchema = new Schema<IPriTestEvaluation>(
  {
    responseId: { type: Schema.Types.ObjectId, ref: 'PriTestResponse', required: true, index: true },
    batch: { type: String, maxlength: 80, index: true },
    questionBankId: { type: Schema.Types.ObjectId, ref: 'PriTestBank', required: true, index: true },
    studentUserId: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    status: { type: String, enum: ['completed'], default: 'completed' },
    mcqCorrect: { type: Number, required: true, min: 0 },
    mcqTotal: { type: Number, required: true, min: 0 },
    totalScore: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    domains: { type: [PriTestEvaluationDomainSchema], default: [] },
    overallStatus: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending', index: true },
    traitResults: {
      type: Map,
      of: {
        score: Number,
        maxScore: Number,
        passed: Boolean,
      },
    },
    evaluatedAt: { type: Date, required: true, default: Date.now },
    mcqPriScore: { type: Number, default: 0 },
    writtenPriScore: { type: Number, default: 0 },
    psychometricPriScore: { type: Number, default: 0 },
    priGatewayPassed: { type: Boolean, default: false },
    aiInsights: { type: Schema.Types.Mixed },
    solutionKey: [{
      questionId: { type: String },
      questionText: { type: String },
      correctAnswer: { type: String },
      domain: { type: String },
      subSkill: { type: String },
      _id: false,
    }],
    insightsFetchedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'pri_test_evaluations',
  }
);

PriTestEvaluationSchema.index({ responseId: 1, studentUserId: 1, questionBankId: 1 });
PriTestEvaluationSchema.index({ studentUserId: 1, institutionId: 1, evaluatedAt: -1 });

const PriTestEvaluation: Model<IPriTestEvaluation> =
  (mongoose.models.PriTestEvaluation as Model<IPriTestEvaluation>) ||
  mongoose.model<IPriTestEvaluation>('PriTestEvaluation', PriTestEvaluationSchema);

export default PriTestEvaluation;
