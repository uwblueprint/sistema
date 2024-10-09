import { SignInButton } from '../components/SignInButton';
import { SistemaLogoColour } from '../components/SistemaLogoColour';
import { Box, Flex, Text } from '@chakra-ui/react';

export default function Index() {
  return (
    <Flex
      direction="column" // stack items vertically
      align="center" // center items horizontally
      justify="center" // center items vertically
      height="100vh" // make flex container take full viewport height
    >
      <Box width="280px" height="auto" mb="5">
        <SistemaLogoColour />
      </Box>

      <Text color="text" fontSize="small" mb="3">
        Only sign in with a Sistema email.
      </Text>

      <SignInButton />
    </Flex>
  );
}
