import './globals.css';

import type { Metadata } from 'next';
import type React from 'react';
import { Toaster } from 'sonner';

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
  generator: 'Next.js'
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
      </body>
    </html>
  );
}
