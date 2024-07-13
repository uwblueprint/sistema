import { ChakraProvider } from '@chakra-ui/react';

import theme from '../theme';
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export default function EmailBS() {
  const fetchAbsences = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('api/scheduleEmails');
      const data = res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <button onClick={fetchAbsences}>Query DB</button>
    </div>
  );
}
