import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificateRequest extends Document {
  instituteWallet: string;
  userWallet: string;
  certificateDetails: {
    title: string;
    studentName: string;
    course: string;
    issueDate: string;
    certificateType: 'Academic' | 'Professional' | 'Achievement';
    carbonScore?: number;
    sustainabilityTag?: string;
    ecoDescription?: string;
    pdfURI?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'minted';
  metadataURI?: string;
  tokenId?: number;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateRequestSchema = new Schema<ICertificateRequest>({
  instituteWallet: { type: String, required: true, lowercase: true },
  userWallet: { type: String, required: true, lowercase: true },
  certificateDetails: {
    title: { type: String, required: true },
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    issueDate: { type: String, required: true },
    certificateType: { type: String, required: true, enum: ['Academic', 'Professional', 'Achievement'] },
    carbonScore: { type: Number, default: 0 },
    sustainabilityTag: { type: String, default: 'Green', enum: ['Green', 'Neutral', 'High Impact'] },
    ecoDescription: { type: String, default: '' },
    pdfURI: { type: String, default: '' },
  },
  status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected', 'minted'] },
  metadataURI: { type: String, default: '' },
  tokenId: { type: Number },
  txHash: { type: String, default: '' },
}, {
  timestamps: true,
});

CertificateRequestSchema.index({ userWallet: 1, status: 1 });
CertificateRequestSchema.index({ instituteWallet: 1 });

export const CertificateRequest = mongoose.model<ICertificateRequest>('CertificateRequest', CertificateRequestSchema);
