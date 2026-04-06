export const ROLES = { USER: 'user', INSTITUTE: 'institute' } as const;

export const ROUTES = {
  HOME: '/',
  CONNECT: '/connect',
  ROLE_SELECT: '/connect/role',
  DASHBOARD: '/dashboard',
  ASSETS: '/dashboard/assets',
  REGISTER_ASSET: '/dashboard/assets/register',
  CERTIFICATES: '/dashboard/certificates',
  PENDING_REQUESTS: '/dashboard/certificates/pending',
  VERIFY: '/dashboard/verify',
  INSTITUTE_REQUEST: '/institute/request',
  ADMIN: '/admin',
} as const;

export const QR_PREFIX_ASSET = 'unitrust:asset:';
export const QR_PREFIX_CERT = 'unitrust:cert:';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
export const POLYGONSCAN_URL = process.env.NEXT_PUBLIC_POLYGONSCAN_URL || 'https://amoy.polygonscan.com';
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
export const ADMIN_WALLET = (process.env.NEXT_PUBLIC_ADMIN_WALLET || '').toLowerCase();

export const CERTIFICATE_TYPES = ['Academic', 'Professional', 'Achievement'] as const;
export const ASSET_CATEGORIES = ['Electronics', 'Document', 'Property', 'Vehicle', 'Other'] as const;
export const SUSTAINABILITY_TAGS = ['Green', 'Neutral', 'High Impact'] as const;
