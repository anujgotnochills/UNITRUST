export interface CarbonData {
  carbonScore: number;
  sustainabilityTag: 'Green' | 'Neutral' | 'High Impact';
  ecoDescription?: string;
}

export interface TransferRecord {
  from: string;
  to: string;
  timestamp: number;
}

export interface AssetMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface Asset {
  tokenId: number;
  ownerWallet: string;
  metadataURI: string;
  txHash: string;
  carbonScore?: number;
  sustainabilityTag?: string;
  createdAt: string;
  metadata?: AssetMetadata;
  transferHistory?: TransferRecord[];
}
