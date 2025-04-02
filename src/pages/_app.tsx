import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import theme from '../../theme/theme';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <Head>
          <link rel="icon" href="/images/favicon.ico" />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/images/apple-icon.png"
          />

          <link rel="manifest" href="/images/manifest.json" />

          <meta name="apple-mobile-web-app-title" content="Sistema" />
          <meta name="application-name" content="Sistema" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="msapplication-TileColor" content="#ffffff" />

          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;
