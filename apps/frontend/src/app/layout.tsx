'use client';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>UniTrust — Own it. Prove it. Track it.</title>
        <meta name="description" content="Register physical assets as NFTs, receive soulbound certificates, and track carbon footprint on Polygon." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={lightTheme({
                accentColor: '#2563EB',
                accentColorForeground: 'white',
                borderRadius: 'medium',
                fontStack: 'system',
              })}
            >
              <Navbar />
              <main>{children}</main>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    borderRadius: '10px',
                    padding: '12px 16px',
                  },
                }}
              />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
