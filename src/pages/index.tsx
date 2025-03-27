import { Box, Flex, Text } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SignInButton } from '../components/SignInButton';
import { TacetLogo } from '../components/SistemaLogoColour';

export default function Index(): JSX.Element | null {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/calendar');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') return null;

  return (
    <Flex direction="column" align="center" justify="center" height="100vh">
      <Box width="280px" height="auto" mb="5">
        <TacetLogo />
      </Box>

      <Text color="text" fontSize="small" mb="3">
        Only sign in with a Sistema email.
      </Text>

      <SignInButton />
    </Flex>
  );
}
