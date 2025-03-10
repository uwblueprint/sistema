import { Box, Flex, Text } from '@chakra-ui/react';
import { SignInButton } from '../components/SignInButton';
import { TacetLogo } from '../components/SistemaLogoColour';

export default function Index(): JSX.Element {
  return (
    <Flex direction="column" align="center" justify="center" height="100vh">
      <Box width="280px" height="auto" mb="5" mr="5">
        <TacetLogo />
      </Box>

      <Text color="text" fontSize="small" mb="3">
        Only sign in with a Sistema email.
      </Text>

      <SignInButton />
    </Flex>
  );
}
