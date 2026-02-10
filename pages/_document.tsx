import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta name='description' content='Stream torrents' />
        <link rel='icon' href='./icon-16x16.png' sizes='16x16' type='image/png' />
        <link rel='icon' href='./icon-32x32.png' sizes='32x32' type='image/png' />
        <link rel='icon' href='./icon-64x64.png' sizes='64x64' type='image/png' />
        <link rel='icon' href='./icon-128x128.png' sizes='128x128' type='image/png' />
        <link rel='icon' href='./icon-256x256.png' sizes='256x256' type='image/png' />
        <link rel='icon' href='./icon-512x512.png' sizes='512x512' type='image/png' />
        <link rel='apple-touch-icon' href='./icon-512x512.png' />
      </Head>
      <body className={'font-sans antialiased dark'}>
        <Main />
        <Script src='./webOSTVjs-1.2.10/webOSTV.js' strategy='beforeInteractive' />
        <NextScript />
      </body>
    </Html>
  );
}
