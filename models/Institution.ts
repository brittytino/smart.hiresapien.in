import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  code: string;
  institutionAdminId: Types.ObjectId;
  facultySlotLimit: number;
  studentSlotLimit: number;
  createdByAdmin: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: [150, 'Institution name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Institution code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Institution code must have at least 3 characters'],
      maxlength: [20, 'Institution code cannot exceed 20 characters'],
    },
    institutionAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      index: true,
    },
    facultySlotLimit: {
      type: Number,
      required: true,
      min: [0, 'Faculty slot limit cannot be negative'],
      default: 0,
    },
    studentSlotLimit: {
      type: Number,
      required: true,
      min: [0, 'Student slot limit cannot be negative'],
      default: 0,
    },
    createdByAdmin: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'institutions',
  }
);

const Institution: Model<IInstitution> =
  (mongoose.models.Institution as Model<IInstitution>) ||
  mongoose.model<IInstitution>('Institution', InstitutionSchema);

export default Institution;
