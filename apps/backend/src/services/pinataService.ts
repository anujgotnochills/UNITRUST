import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env';

const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

/**
 * Uploads a file buffer to Pinata IPFS
 */
export async function uploadFileToPinata(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ ipfsHash: string; ipfsUrl: string; gatewayUrl: string }> {
  const formData = new FormData();
  formData.append('file', fileBuffer, { filename: fileName });

  const metadata = JSON.stringify({ name: fileName });
  formData.append('pinataMetadata', metadata);

  const response = await axios.post(PINATA_FILE_URL, formData, {
    maxBodyLength: Infinity,
    headers: {
      ...formData.getHeaders(),
      pinata_api_key: env.PINATA_API_KEY,
      pinata_secret_api_key: env.PINATA_SECRET_KEY,
    },
  });

  const ipfsHash = response.data.IpfsHash;
  return {
    ipfsHash,
    ipfsUrl: `ipfs://${ipfsHash}`,
    gatewayUrl: `${env.PINATA_GATEWAY}${ipfsHash}`,
  };
}

/**
 * Uploads a JSON metadata object to Pinata IPFS
 */
export async function uploadJSONToPinata(
  jsonData: Record<string, any>,
  name?: string
): Promise<{ ipfsHash: string; metadataUri: string; gatewayUrl: string }> {
  const body = {
    pinataContent: jsonData,
    pinataMetadata: { name: name || 'metadata.json' },
  };

  const response = await axios.post(PINATA_JSON_URL, body, {
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: env.PINATA_API_KEY,
      pinata_secret_api_key: env.PINATA_SECRET_KEY,
    },
  });

  const ipfsHash = response.data.IpfsHash;
  return {
    ipfsHash,
    metadataUri: `ipfs://${ipfsHash}`,
    gatewayUrl: `${env.PINATA_GATEWAY}${ipfsHash}`,
  };
}
