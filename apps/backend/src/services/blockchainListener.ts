import { ethers } from 'ethers';
import { env } from '../config/env';
import { AssetRecord } from '../models/AssetRecord';
import { CertificateRecord } from '../models/CertificateRecord';
import { CertificateRequest } from '../models/CertificateRequest';

// ABIs — only the events we need
const PRODUCT_NFT_ABI = [
  'event AssetMinted(uint256 indexed tokenId, address indexed owner, string tokenURI)',
  'event AssetTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 timestamp)',
];

const CERTIFICATE_NFT_ABI = [
  'event CertificateMinted(uint256 indexed tokenId, address indexed issuer, address indexed student, string requestId, string tokenURI)',
];

let provider: ethers.JsonRpcProvider;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(env.ALCHEMY_RPC);
  }
  return provider;
}

/**
 * Starts listening for on-chain events and syncs to MongoDB
 */
export function startBlockchainListeners(): void {
  if (!env.ALCHEMY_RPC || !env.PRODUCT_NFT_ADDRESS || !env.CERTIFICATE_NFT_ADDRESS) {
    console.log('⚠️  Blockchain listeners skipped — missing env vars');
    return;
  }

  const rpcProvider = getProvider();

  // Listen for AssetMinted events
  const productNFT = new ethers.Contract(env.PRODUCT_NFT_ADDRESS, PRODUCT_NFT_ABI, rpcProvider);

  productNFT.on('AssetMinted', async (tokenId: bigint, owner: string, tokenURI: string) => {
    console.log(`📦 AssetMinted: Token #${tokenId} to ${owner}`);
    try {
      await AssetRecord.findOneAndUpdate(
        { tokenId: Number(tokenId) },
        {
          tokenId: Number(tokenId),
          ownerWallet: owner.toLowerCase(),
          metadataURI: tokenURI,
          txHash: '',
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Error syncing AssetMinted event:', err);
    }
  });

  productNFT.on('AssetTransferred', async (tokenId: bigint, from: string, to: string) => {
    console.log(`🔄 AssetTransferred: Token #${tokenId} from ${from} to ${to}`);
    try {
      await AssetRecord.findOneAndUpdate(
        { tokenId: Number(tokenId) },
        { ownerWallet: to.toLowerCase() }
      );
    } catch (err) {
      console.error('Error syncing AssetTransferred event:', err);
    }
  });

  // Listen for CertificateMinted events
  const certificateNFT = new ethers.Contract(env.CERTIFICATE_NFT_ADDRESS, CERTIFICATE_NFT_ABI, rpcProvider);

  certificateNFT.on('CertificateMinted', async (tokenId: bigint, issuer: string, student: string, requestId: string, tokenURI: string) => {
    console.log(`🎓 CertificateMinted: Token #${tokenId} — Request ${requestId}`);
    try {
      // Update CertificateRequest status to minted
      await CertificateRequest.findByIdAndUpdate(requestId, {
        status: 'minted',
        tokenId: Number(tokenId),
      });

      // Create CertificateRecord
      await CertificateRecord.findOneAndUpdate(
        { tokenId: Number(tokenId) },
        {
          tokenId: Number(tokenId),
          issuerWallet: issuer.toLowerCase(),
          holderWallet: student.toLowerCase(),
          metadataURI: tokenURI,
          txHash: '',
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Error syncing CertificateMinted event:', err);
    }
  });

  console.log('🔗 Blockchain event listeners started');
}
