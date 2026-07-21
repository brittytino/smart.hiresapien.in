import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ShareStatus = 'pending' | 'accepted' | 'rejected';

export interface IPsychometricTestAssignment extends Document {
  institutionId: Types.ObjectId;
  status: ShareStatus;
  examStartDate: Date;
  examEndDate: Date;
  assignedAt: Date;
  respondedAt?: Date;
  assignedBy: string;
}

const PsychometricTestAssignmentSchema = new Schema<IPsychometricTestAssignment>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    examStartDate: {
      type: Date,
      required: true,
    },
    examEndDate: {
      type: Date,
      required: true,
    },
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    assignedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'psychometric_test_assignments',
  }
);

const PsychometricTestAssignment: Model<IPsychometricTestAssignment> =
  (mongoose.models.PsychometricTestAssignment as Model<IPsychometricTestAssignment>) ||
  mongoose.model<IPsychometricTestAssignment>('PsychometricTestAssignment', PsychometricTestAssignmentSchema);

export default PsychometricTestAssignment;
