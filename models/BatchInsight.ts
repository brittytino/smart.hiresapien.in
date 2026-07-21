import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IBatchInsight extends Document {
  institutionId: Types.ObjectId;
  batchKey: string;
  batchName: string;
  totalStudents: number;
  evaluatedStudents: number;
  averageScore: number;
  passRate: number;
  provider?: string;
  generatedBy?: string;
  generationMode?: 'manual' | 'auto';
  status: 'generated' | 'skipped_threshold' | 'failed';
  aiInsights?: Record<string, unknown>;
  batchMetrics?: Record<string, unknown>;
  promptVersion?: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BatchInsightSchema = new Schema<IBatchInsight>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    batchKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    batchName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, 'Batch name cannot exceed 120 characters'],
    },
    totalStudents: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    evaluatedStudents: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    averageScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    passRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    provider: {
      type: String,
      trim: true,
    },
    generatedBy: {
      type: String,
      trim: true,
    },
    generationMode: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['generated', 'skipped_threshold', 'failed'],
      default: 'generated',
      index: true,
    },
    aiInsights: {
      type: Schema.Types.Mixed,
    },
    batchMetrics: {
      type: Schema.Types.Mixed,
    },
    promptVersion: {
      type: String,
      trim: true,
      default: 'v1',
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'batch_insights',
  }
);

BatchInsightSchema.index({ institutionId: 1, batchKey: 1 }, { unique: true });
BatchInsightSchema.index({ institutionId: 1, generatedAt: -1 });

const BatchInsight: Model<IBatchInsight> =
  (mongoose.models.BatchInsight as Model<IBatchInsight>) ||
  mongoose.model<IBatchInsight>('BatchInsight', BatchInsightSchema);

export default BatchInsight;
