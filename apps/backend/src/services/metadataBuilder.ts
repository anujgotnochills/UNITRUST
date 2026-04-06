/**
 * Builds ERC-721 standard metadata JSON for assets
 */
export function buildAssetMetadata(params: {
  name: string;
  description: string;
  imageUri: string;
  category: string;
  carbonScore: number;
  sustainabilityTag: string;
  ecoDescription?: string;
  originalOwner: string;
}): Record<string, any> {
  return {
    name: params.name,
    description: params.description,
    image: params.imageUri,
    attributes: [
      { trait_type: 'Category', value: params.category },
      { trait_type: 'Carbon Score', value: params.carbonScore },
      { trait_type: 'Sustainability Tag', value: params.sustainabilityTag },
      { trait_type: 'Eco Description', value: params.ecoDescription || '' },
      { trait_type: 'Original Owner', value: params.originalOwner },
      { trait_type: 'Registered On', value: new Date().toISOString() },
    ],
  };
}

/**
 * Builds ERC-721 standard metadata JSON for certificates
 */
export function buildCertificateMetadata(params: {
  title: string;
  description?: string;
  studentName: string;
  course: string;
  issueDate: string;
  certificateType: string;
  issuerWallet: string;
  instituteName: string;
  instituteLogo: string;
  carbonScore: number;
  sustainabilityTag: string;
  requestId: string;
  pdfUri?: string;
}): Record<string, any> {
  const metadata: Record<string, any> = {
    name: params.title,
    description: params.description || `Certificate: ${params.title} awarded to ${params.studentName} by ${params.instituteName}`,
    image: params.instituteLogo,
    attributes: [
      { trait_type: 'Student Name', value: params.studentName },
      { trait_type: 'Course', value: params.course },
      { trait_type: 'Issue Date', value: params.issueDate },
      { trait_type: 'Certificate Type', value: params.certificateType },
      { trait_type: 'Issuer Wallet', value: params.issuerWallet },
      { trait_type: 'Institute Name', value: params.instituteName },
      { trait_type: 'Institute Logo', value: params.instituteLogo },
      { trait_type: 'Carbon Score', value: params.carbonScore },
      { trait_type: 'Sustainability Tag', value: params.sustainabilityTag },
      { trait_type: 'Request ID', value: params.requestId },
    ],
  };

  if (params.pdfUri) {
    metadata.external_url = params.pdfUri;
  }

  return metadata;
}
