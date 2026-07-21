import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { DOMAINS } from '@/lib/domains';

const DOMAIN_IDS = DOMAINS.map((d) => d.id);

export type QuestionType = 'mcq' | 'written';
export type ShareStatus = 'pending' | 'accepted' | 'rejected';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface IPriTestBankSubskill {
  name: string;
  share: number;
  priContribution: number;
  questionCount: number;
  questionType: QuestionType;
  difficultyShare: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface IPriTestBankDomain {
  domainId: string;
  domainName: string;
  domainShare: number;
  domainStartTime: string;
  domainEndTime: string;
  subskills: IPriTestBankSubskill[];
}

export interface IPriTestBankOption {
  label: string;
  text: string;
  imageUrl?: string;
  score?: number;
}

export interface IPriTestBankQuestion {
  domainId: string;
  domainName: string;
  subSkill: string;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  questionText: string;
  questionImageUrl?: string;
  caseContext?: string;
  caseContextImageUrl?: string;
  options: IPriTestBankOption[];
  correctAnswer?: string;
}

export interface IPriTestBankInstitutionShare {
  institutionId: Types.ObjectId;
  status: ShareStatus;
  examStartDate: Date;
  examEndDate: Date;
  sharedAt: Date;
  respondedAt?: Date;
  isResultsPublished?: boolean;
}

export interface IPriTestBank extends Document {
  title: string;
  program: string;
  status: 'draft' | 'published' | 'completed';
  domains: IPriTestBankDomain[];
  questions: IPriTestBankQuestion[];
  institutions: IPriTestBankInstitutionShare[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PriTestBankSubskillSchema = new Schema<IPriTestBankSubskill>(
  {
    name: { type: String, required: true, maxlength: 200 },
    share: { type: Number, required: true, min: 0, max: 100 },
    priContribution: { type: Number, required: true, min: 0, max: 100 },
    questionCount: { type: Number, required: true, min: 1, max: 200 },
    questionType: { type: String, required: true, enum: ['mcq', 'written'] },
    difficultyShare: {
      easy: { type: Number, required: true, min: 0, max: 100 },
      medium: { type: Number, required: true, min: 0, max: 100 },
      hard: { type: Number, required: true, min: 0, max: 100 },
    },
  },
  { _id: false }
);

const PriTestBankDomainSchema = new Schema<IPriTestBankDomain>(
  {
    domainId: {
      type: String,
      required: true,
      enum: { values: DOMAIN_IDS, message: 'Invalid domain' },
    },
    domainName: { type: String, required: true, maxlength: 200 },
    domainShare: { type: Number, required: true, min: 0, max: 100 },
    domainStartTime: { type: String, required: true, maxlength: 5 },
    domainEndTime: { type: String, required: true, maxlength: 5 },
    subskills: { type: [PriTestBankSubskillSchema], default: [] },
  },
  { _id: false }
);

const PriTestBankOptionSchema = new Schema<IPriTestBankOption>(
  {
    label: { type: String, required: true, maxlength: 2 },
    text: { type: String, required: true, maxlength: 2000 },
    imageUrl: { type: String, maxlength: 2000 },
    score: { type: Number, min: -1, max: 1 },
  },
  { _id: false }
);

const PriTestBankQuestionSchema = new Schema<IPriTestBankQuestion>(
  {
    domainId: { type: String, required: true },
    domainName: { type: String, required: true },
    subSkill: { type: String, required: true },
    questionType: { type: String, required: true, enum: ['mcq', 'written'] },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questionText: { type: String, required: true, minlength: 10, maxlength: 5000 },
    questionImageUrl: { type: String, maxlength: 2000 },
    caseContext: { type: String, maxlength: 5000 },
    caseContextImageUrl: { type: String, maxlength: 2000 },
    options: { type: [PriTestBankOptionSchema], default: [] },
    correctAnswer: { type: String, maxlength: 2 },
  },
  { _id: false }
);

const PriTestBankInstitutionSchema = new Schema<IPriTestBankInstitutionShare>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    examStartDate: { type: Date, required: true },
    examEndDate: { type: Date, required: true },
    sharedAt: { type: Date, required: true, default: Date.now },
    respondedAt: { type: Date },
    isResultsPublished: { type: Boolean, default: false },
  },
  { _id: false }
);

const PriTestBankSchema = new Schema<IPriTestBank>(
  {
    title: { type: String, required: true, maxlength: 200 },
    program: { type: String, required: true, maxlength: 120 },
    status: { type: String, enum: ['draft', 'published', 'completed'], default: 'draft', index: true },
    domains: { type: [PriTestBankDomainSchema], default: [] },
    questions: { type: [PriTestBankQuestionSchema], default: [] },
    institutions: { type: [PriTestBankInstitutionSchema], default: [] },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'pri_test_banks',
  }
);

const PriTestBank: Model<IPriTestBank> =
  (mongoose.models.PriTestBank as Model<IPriTestBank>) ||
  mongoose.model<IPriTestBank>('PriTestBank', PriTestBankSchema);

export default PriTestBank;
