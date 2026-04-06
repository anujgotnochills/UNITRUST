export const ROLES = { USER: 'user', INSTITUTE: 'institute' } as const;

export const ROUTES = {
  HOME: '/',
  ROLE_SELECT: '/auth/role',
  USER_SETUP: '/user/setup',
  USER_ASSETS: '/user/assets',
  USER_CERTIFICATES: '/user/certificates',
  INSTITUTE_SETUP: '/institute/setup',
  INSTITUTE_AWARD: '/institute/award',
  INSTITUTE_VERIFY: '/institute/verify',
} as const;

export const QR_PREFIX_ASSET = 'unitrust:asset:';
export const QR_PREFIX_CERT = 'unitrust:cert:';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
export const POLYGONSCAN_URL = process.env.NEXT_PUBLIC_POLYGONSCAN_URL || 'https://amoy.polygonscan.com';
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

export const CERTIFICATE_TYPES = ['Academic', 'Professional', 'Achievement'] as const;
export const ASSET_CATEGORIES = ['Electronics', 'Document', 'Property', 'Vehicle', 'Other'] as const;
export const SUSTAINABILITY_TAGS = ['Green', 'Neutral', 'High Impact'] as const;
