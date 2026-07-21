import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type UserRole = 'institution_admin' | 'faculty' | 'student';

export interface IUserAccount extends Document {
  username: string;
  password: string;
  role: UserRole;
  institutionId: Types.ObjectId;
  studentId?: string;
  batch?: string;
  fullName?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserAccountSchema = new Schema<IUserAccount>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['institution_admin', 'faculty', 'student'],
      required: true,
      index: true,
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
    batch: {
      type: String,
      trim: true,
      maxlength: [80, 'Batch cannot exceed 80 characters'],
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'user_accounts',
  }
);

UserAccountSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    delete ret.password;
    return ret;
  },
});

const UserAccount: Model<IUserAccount> =
  (mongoose.models.UserAccount as Model<IUserAccount>) ||
  mongoose.model<IUserAccount>('UserAccount', UserAccountSchema);

export default UserAccount;
