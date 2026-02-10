import 'core-js/modules/es.string.replace-all';
import '../styles/globals.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'sonner';

function TorrPlayApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>TorrPlay</title>
      </Head>
      <Component {...pageProps} />
      <Toaster theme='dark' />
    </>
  );
}

export default TorrPlayApp;
