import { QR_PREFIX_ASSET, QR_PREFIX_CERT } from '../constants/qr';

/**
 * Generates QR data string for an asset
 */
export function generateAssetQRData(tokenId: number | string): string {
  return `${QR_PREFIX_ASSET}${tokenId}`;
}

/**
 * Generates QR data string for a certificate
 */
export function generateCertQRData(tokenId: number | string): string {
  return `${QR_PREFIX_CERT}${tokenId}`;
}

/**
 * Parses a QR data string and returns the type and tokenId
 */
export function parseQRData(data: string): { type: 'asset' | 'cert' | 'unknown'; tokenId: string } {
  if (data.startsWith(QR_PREFIX_ASSET)) {
    return { type: 'asset', tokenId: data.slice(QR_PREFIX_ASSET.length) };
  }
  if (data.startsWith(QR_PREFIX_CERT)) {
    return { type: 'cert', tokenId: data.slice(QR_PREFIX_CERT.length) };
  }
  return { type: 'unknown', tokenId: '' };
}
