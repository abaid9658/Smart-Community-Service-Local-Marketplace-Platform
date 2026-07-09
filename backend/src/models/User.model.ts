import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProfile {
  fullName: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  skills: string[];
  portfolioLinks: string[];
  socialLinks?: Record<string, string>;
  totalSales: number;
  completedServices: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  role: 'USER' | 'SELLER' | 'SERVICE_PROVIDER' | 'ADMIN' | 'SUPER_ADMIN';
  isEmailVerified: boolean;
  emailVerifyToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  isSuspended: boolean;
  suspendReason?: string;
  lastSeen?: Date;
  isOnline: boolean;
  viewsCount?: number;
  profile: IProfile;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  fullName: { type: String, required: true },
  avatarUrl: String,
  coverImageUrl: String,
  bio: String,
  phone: String,
  address: String,
  city: String,
  country: String,
  skills: { type: [String], default: [] },
  portfolioLinks: { type: [String], default: [] },
  socialLinks: { type: Schema.Types.Mixed },
  totalSales: { type: Number, default: 0 },
  completedServices: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['USER', 'SELLER', 'SERVICE_PROVIDER', 'ADMIN', 'SUPER_ADMIN'],
    default: 'USER',
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  isSuspended: { type: Boolean, default: false },
  suspendReason: String,
  lastSeen: Date,
  isOnline: { type: Boolean, default: false },
  viewsCount: { type: Number, default: 0 },
  profile: { type: ProfileSchema, required: true },
}, { timestamps: true, collection: 'users' });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
