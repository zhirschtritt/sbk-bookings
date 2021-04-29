import React, { PropsWithChildren } from 'react';
import { ChakraProvider } from '@chakra-ui/react';

function MyApp({ pageProps, Component }: PropsWithChildren<any>) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
export default MyApp;
