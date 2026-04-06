import mongoose, { Schema, Document } from 'mongoose';

export interface IHiddenCertificate extends Document {
  walletAddress: string;
  tokenId: number;
}

const HiddenCertificateSchema = new Schema<IHiddenCertificate>({
  walletAddress: { type: String, required: true, lowercase: true },
  tokenId: { type: Number, required: true },
});

HiddenCertificateSchema.index({ walletAddress: 1, tokenId: 1 }, { unique: true });

export const HiddenCertificate = mongoose.model<IHiddenCertificate>('HiddenCertificate', HiddenCertificateSchema);
