import { ChakraProvider } from '@chakra-ui/react';

import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import theme from '../../theme/theme';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;
