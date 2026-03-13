import './globals.css';

import type { Metadata } from 'next';
import type React from 'react';
import { Toaster } from 'sonner';

import { ScrollButtons } from '@/components/ui/scroll-buttons';

export const metadata: Metadata = {
  title: 'TorrPlay',
  description: 'Stream torrents',
  icons: {
    icon: [
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-512x512.png',
  },
  viewport: 'user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={'font-sans antialiased dark'}>
        {children}
        <Toaster theme='dark' />
        <ScrollButtons />
      </body>
    </html>
  );
}
