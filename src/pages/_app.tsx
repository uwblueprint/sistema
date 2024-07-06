import { ChakraProvider } from '@chakra-ui/react';

import theme from '../theme';
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import useCronJob from '../../hooks/useCronJob';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useCronJob();
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;
