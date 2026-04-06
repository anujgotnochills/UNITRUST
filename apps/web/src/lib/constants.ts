export const ROLES = { USER: 'user', INSTITUTE: 'institute' } as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ASSETS: '/dashboard/assets',
  REGISTER_ASSET: '/dashboard/assets/register',
  SCAN_QR: '/dashboard/assets/scan',
  CERTIFICATES: '/dashboard/certificates',
  PENDING_REQUESTS: '/dashboard/certificates/pending',
  VERIFY: '/dashboard/verify',
  NEW_REQUEST: '/dashboard/requests/new',
  MY_REQUESTS: '/dashboard/requests',
} as const;

export const QR_PREFIX_ASSET = 'unitrust:asset:';
export const QR_PREFIX_CERT = 'unitrust:cert:';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
export const POLYGONSCAN_URL = process.env.NEXT_PUBLIC_POLYGONSCAN_URL || 'https://amoy.polygonscan.com';
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

export const CERTIFICATE_TYPES = ['Academic', 'Professional', 'Achievement'] as const;
export const ASSET_CATEGORIES = ['Electronics', 'Document', 'Property', 'Vehicle', 'Other'] as const;
export const SUSTAINABILITY_TAGS = ['Green', 'Neutral', 'High Impact'] as const;
