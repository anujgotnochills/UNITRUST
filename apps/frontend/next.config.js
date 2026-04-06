/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['gateway.pinata.cloud', 'ipfs.io', 'chocolate-leading-ptarmigan-818.mypinata.cloud'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mypinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

module.exports = nextConfig;

