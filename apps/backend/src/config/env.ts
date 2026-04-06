import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '4000',
  MONGODB_URI: process.env.MONGODB_URI || '',
  PINATA_API_KEY: process.env.PINATA_API_KEY || '',
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY || '',
  PINATA_GATEWAY: process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
  PRODUCT_NFT_ADDRESS: process.env.PRODUCT_NFT_ADDRESS || '',
  CERTIFICATE_NFT_ADDRESS: process.env.CERTIFICATE_NFT_ADDRESS || '',
  ALCHEMY_RPC: process.env.ALCHEMY_RPC || '',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:3001',
  BACKEND_PRIVATE_KEY: process.env.BACKEND_PRIVATE_KEY || '',
};
