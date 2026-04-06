import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  walletAddress: string;
  name?: string;
  profilePic?: string;
  role: 'user';
  createdAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  walletAddress: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  role: { type: String, default: 'user', enum: ['user'] },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
