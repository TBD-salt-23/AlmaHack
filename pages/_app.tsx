import { SessionProvider } from 'next-auth/react';
import './styles.css';

import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import Head from 'next/head';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  console.log('This is session', session);
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
