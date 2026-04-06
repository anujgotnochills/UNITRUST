export const POLYGON_AMOY = {
  chainId: 80002,
  name: 'Polygon Amoy Testnet',
  rpcUrl: 'https://rpc-amoy.polygon.technology',
  explorerUrl: 'https://amoy.polygonscan.com',
  currency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
} as const;

export const NETWORK_CONFIG = POLYGON_AMOY;
