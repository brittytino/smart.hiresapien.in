import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IBatch extends Document {
  institutionId: Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  assignedFaculty: Types.ObjectId[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      maxlength: [80, 'Batch name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    assignedFaculty: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserAccount',
      },
    ],
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'batches',
    strictPopulate: false,
  } as any
);

BatchSchema.index({ institutionId: 1, name: 1 }, { unique: true });

const Batch: Model<IBatch> =
  (mongoose.models.Batch as Model<IBatch>) ||
  mongoose.model<IBatch>('Batch', BatchSchema);

export default Batch;
