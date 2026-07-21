import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IContributor extends Document {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


/** Shape returned to clients — password is never exposed */
export type ContributorPublic = Omit<
  IContributor,
  'password'
> & { _id: string };

const ContributorSchema = new Schema<IContributor>(
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'contributors',
  }
);

// Prevent password from being serialized in toJSON / toObject by default
ContributorSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    delete ret.password;
    return ret;
  },
});

const Contributor: Model<IContributor> =
  (mongoose.models.Contributor as Model<IContributor>) ||
  mongoose.model<IContributor>('Contributor', ContributorSchema);

export default Contributor;
