import mongoose, { Schema, Document } from 'mongoose';

export interface IAssetRecord extends Document {
  tokenId: number;
  ownerWallet: string;
  metadataURI: string;
  txHash: string;
  carbonScore?: number;
  sustainabilityTag?: string;
  createdAt: Date;
}

const AssetRecordSchema = new Schema<IAssetRecord>({
  tokenId: { type: Number, required: true, unique: true },
  ownerWallet: { type: String, required: true, lowercase: true },
  metadataURI: { type: String, required: true },
  txHash: { type: String, required: true },
  carbonScore: { type: Number, default: 0 },
  sustainabilityTag: { type: String, default: 'Green', enum: ['Green', 'Neutral', 'High Impact'] },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

AssetRecordSchema.index({ ownerWallet: 1 });

export const AssetRecord = mongoose.model<IAssetRecord>('AssetRecord', AssetRecordSchema);
