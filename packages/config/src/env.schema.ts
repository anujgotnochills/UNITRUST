import { z } from 'zod';

export const frontendEnvSchema = z.object({
  NEXT_PUBLIC_CHAIN_ID: z.string().default('80002'),
  NEXT_PUBLIC_PRODUCT_NFT_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_CERTIFICATE_NFT_ADDRESS: z.string().startsWith('0x'),
  NEXT_PUBLIC_ALCHEMY_RPC: z.string().url(),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_BACKEND_URL: z.string().url(),
  NEXT_PUBLIC_POLYGONSCAN_URL: z.string().url().default('https://amoy.polygonscan.com'),
  NEXT_PUBLIC_IPFS_GATEWAY: z.string().url().default('https://gateway.pinata.cloud/ipfs/'),
  NEXT_PUBLIC_BICONOMY_API_KEY: z.string().optional(),
});

export const backendEnvSchema = z.object({
  PORT: z.string().default('4000'),
  MONGODB_URI: z.string().min(1),
  PINATA_API_KEY: z.string().min(1),
  PINATA_SECRET_KEY: z.string().min(1),
  PINATA_GATEWAY: z.string().url().default('https://gateway.pinata.cloud/ipfs/'),
  PRODUCT_NFT_ADDRESS: z.string().startsWith('0x'),
  CERTIFICATE_NFT_ADDRESS: z.string().startsWith('0x'),
  ALCHEMY_RPC: z.string().url(),
  ALLOWED_ORIGIN: z.string().default('http://localhost:3000'),
});

export const contractsEnvSchema = z.object({
  ALCHEMY_AMOY_RPC: z.string().url(),
  DEPLOYER_PRIVATE_KEY: z.string().min(64),
  POLYGONSCAN_API_KEY: z.string().optional(),
});
