import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

export const metadata: Metadata = {
  title: 'UniTrust — Decentralized Trust for the Real World',
  description:
    'UniTrust brings asset ownership, credential verification, and carbon tracking on-chain. Building the trust infrastructure for Web3.',
  keywords: [
    'UniTrust',
    'blockchain',
    'Web3',
    'asset ownership',
    'credential verification',
    'carbon tracking',
    'decentralized',
  ],
  openGraph: {
    title: 'UniTrust — Decentralized Trust for the Real World',
    description:
      'Asset ownership, credential verification, and carbon tracking on-chain.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="bg-background text-[#1A1A1A] font-body antialiased dot-grid-bg relative">
        <Web3Provider>
          <SmoothScrollProvider>
            {children}
            <Toaster position="bottom-right" />
          </SmoothScrollProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
