import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPriQuestionOption {
  label: string;
  text: string;
}

export interface IPriQuestion extends Document {
  questionText: string;
  options: IPriQuestionOption[];
  correctAnswer: string;
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnswerEntry {
  questionId: Types.ObjectId;
  selectedOption: string;
  isCorrect: boolean;
  
}

export interface ITestAttempt extends Document {
  studentUserId: Types.ObjectId;
  institutionId: Types.ObjectId;
  answers: IAnswerEntry[];
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PriQuestionOptionSchema = new Schema<IPriQuestionOption>(
  {
    label: { type: String, required: true, maxlength: 2 },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { _id: false }
);

const PriQuestionSchema = new Schema<IPriQuestion>(
  {
    questionText: {
      type: String,
      required: true,
      minlength: [10, 'Question must be at least 10 characters'],
      maxlength: [3000, 'Question cannot exceed 3000 characters'],
    },
    options: {
      type: [PriQuestionOptionSchema],
      validate: {
        validator: (opts: IPriQuestionOption[]) => opts.length >= 2 && opts.length <= 5,
        message: 'Options must contain between 2 and 5 items',
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      maxlength: 2,
    },
    createdBy: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'pri_questions',
  }
);

const AnswerEntrySchema = new Schema<IAnswerEntry>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'PriQuestion',
      required: true,
    },
    selectedOption: {
      type: String,
      required: true,
      maxlength: 2,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const TestAttemptSchema = new Schema<ITestAttempt>(
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
    answers: {
      type: [AnswerEntrySchema],
      required: true,
      validate: {
        validator: (answers: IAnswerEntry[]) => answers.length > 0,
        message: 'At least one answer is required',
      },
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'test_attempts',
  }
);

export const PriQuestion: Model<IPriQuestion> =
  (mongoose.models.PriQuestion as Model<IPriQuestion>) ||
  mongoose.model<IPriQuestion>('PriQuestion', PriQuestionSchema);

export const TestAttempt: Model<ITestAttempt> =
  (mongoose.models.TestAttempt as Model<ITestAttempt>) ||
  mongoose.model<ITestAttempt>('TestAttempt', TestAttemptSchema);
