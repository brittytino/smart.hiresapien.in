import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IQuestionBankAnswer {
  questionIndex: number;
  questionType: 'mcq' | 'written';
  selectedOption?: string;
  answerText?: string;
  isCorrect?: boolean;
}

export interface IQuestionBankAttempt extends Document {
  questionBankId: Types.ObjectId;
  studentUserId: Types.ObjectId;
  institutionId: Types.ObjectId;
  answers: IQuestionBankAnswer[];
  score: number;
  totalMcq: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionBankAnswerSchema = new Schema<IQuestionBankAnswer>(
  {
    questionIndex: { type: Number, required: true, min: 0 },
    questionType: { type: String, required: true, enum: ['mcq', 'written'] },
    selectedOption: { type: String, maxlength: 2 },
    answerText: { type: String, maxlength: 5000 },
    isCorrect: { type: Boolean },
  },
  { _id: false }
);

const QuestionBankAttemptSchema = new Schema<IQuestionBankAttempt>(
  {
    questionBankId: { type: Schema.Types.ObjectId, ref: 'QuestionBank', required: true, index: true },
    studentUserId: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    answers: { type: [QuestionBankAnswerSchema], default: [] },
    score: { type: Number, required: true, min: 0 },
    totalMcq: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    submittedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  {
    timestamps: true,
    collection: 'question_bank_attempts',
  }
);

const QuestionBankAttempt: Model<IQuestionBankAttempt> =
  (mongoose.models.QuestionBankAttempt as Model<IQuestionBankAttempt>) ||
  mongoose.model<IQuestionBankAttempt>('QuestionBankAttempt', QuestionBankAttemptSchema);

export default QuestionBankAttempt;
