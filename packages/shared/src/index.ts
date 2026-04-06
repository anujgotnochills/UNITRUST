// Types
export type { Role } from './types/role';
export type {
  Asset,
  AssetMetadata,
  CarbonData,
  TransferRecord,
} from './types/asset';
export type {
  Certificate,
  CertificateMetadata,
  CertificateRequest,
  CertificateDetails,
  RequestStatus,
} from './types/certificate';
export type {
  UserProfile,
  InstituteProfile,
} from './types/profile';
export type {
  IPFSUploadResult,
  MetadataJSON,
} from './types/ipfs';

// Constants
export { ROLES } from './constants/roles';
export {
  CARBON_THRESHOLDS,
  CARBON_TAGS,
  CARBON_COLORS,
  CARBON_BG_COLORS,
} from './constants/carbonTags';
export { QR_PREFIX_ASSET, QR_PREFIX_CERT } from './constants/qr';
export { REQUEST_STATUS } from './constants/requestStatus';
export {
  DEFAULT_INSTITUTE_LOGO,
  DEFAULT_USER_AVATAR,
  DEFAULT_INSTITUTE_LOGO_DATA_URI,
  DEFAULT_USER_AVATAR_DATA_URI,
} from './constants/defaults';

// Carbon Database & Scorer
export { CARBON_DATABASE, CATEGORY_DEFAULTS, GLOBAL_FALLBACK } from './constants/carbonDatabase';
export type { CarbonEntry, SustainabilityTag } from './constants/carbonDatabase';
export { calculateCarbonScore } from './utils/carbonScorer';
export type { CarbonScoreResult } from './utils/carbonScorer';

// Utils
export { formatAddress } from './utils/formatAddress';
export { formatDate, formatDateTime } from './utils/formatDate';
export { scoreToTag, tagToColor, tagToBgColor } from './utils/carbonHelpers';
export { generateAssetQRData, generateCertQRData, parseQRData } from './utils/qrHelpers';
