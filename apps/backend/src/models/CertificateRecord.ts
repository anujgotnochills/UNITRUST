import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificateRecord extends Document {
  tokenId: number;
  issuerWallet: string;
  holderWallet: string;
  metadataURI: string;
  txHash: string;
  carbonScore?: number;
  createdAt: Date;
}

const CertificateRecordSchema = new Schema<ICertificateRecord>({
  tokenId: { type: Number, required: true, unique: true },
  issuerWallet: { type: String, required: true, lowercase: true },
  holderWallet: { type: String, required: true, lowercase: true },
  metadataURI: { type: String, required: true },
  txHash: { type: String, required: true },
  carbonScore: { type: Number, default: 0 },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

CertificateRecordSchema.index({ holderWallet: 1 });
CertificateRecordSchema.index({ issuerWallet: 1 });

export const CertificateRecord = mongoose.model<ICertificateRecord>('CertificateRecord', CertificateRecordSchema);
