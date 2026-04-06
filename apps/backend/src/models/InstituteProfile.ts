import mongoose, { Schema, Document } from 'mongoose';

export interface IInstituteProfile extends Document {
  walletAddress: string;
  instituteName: string;
  logo?: string;
  role: 'institute';
  createdAt: Date;
}

const InstituteProfileSchema = new Schema<IInstituteProfile>({
  walletAddress: { type: String, required: true, unique: true, lowercase: true },
  instituteName: { type: String, required: true },
  logo: { type: String, default: '' },
  role: { type: String, default: 'institute', enum: ['institute'] },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

export const InstituteProfile = mongoose.model<IInstituteProfile>('InstituteProfile', InstituteProfileSchema);
