export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'minted';

export interface CertificateDetails {
  title: string;
  studentName: string;
  course: string;
  issueDate: string;
  certificateType: 'Academic' | 'Professional' | 'Achievement';
  carbonScore?: number;
  sustainabilityTag?: 'Green' | 'Neutral' | 'High Impact';
  ecoDescription?: string;
  pdfURI?: string;
}

export interface CertificateRequest {
  requestId: string;
  instituteWallet: string;
  userWallet: string;
  certificateDetails: CertificateDetails;
  status: RequestStatus;
  metadataURI?: string;
  tokenId?: number;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface Certificate {
  tokenId: number;
  issuerWallet: string;
  holderWallet: string;
  metadataURI: string;
  txHash: string;
  carbonScore?: number;
  createdAt: string;
  metadata?: CertificateMetadata;
}
