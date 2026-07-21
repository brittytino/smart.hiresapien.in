import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type QuestionArchiveSource = 'questions' | 'contributor_questions';

export interface IQuestionArchive extends Document {
  sourceCollection: QuestionArchiveSource;
  sourceId: Types.ObjectId;
  archivedAt: Date;
  payload: Record<string, unknown>;
  archivedBy?: string;
}

const QuestionArchiveSchema = new Schema<IQuestionArchive>(
  {
    sourceCollection: {
      type: String,
      required: true,
      enum: ['questions', 'contributor_questions'],
      index: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    archivedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    archivedBy: {
      type: String,
      maxlength: 100,
    },
  },
  {
    timestamps: false,
    collection: 'question_archives',
  }
);

QuestionArchiveSchema.index({ sourceCollection: 1, sourceId: 1, archivedAt: -1 });

const QuestionArchive: Model<IQuestionArchive> =
  (mongoose.models.QuestionArchive as Model<IQuestionArchive>) ||
  mongoose.model<IQuestionArchive>('QuestionArchive', QuestionArchiveSchema);

export default QuestionArchive;
