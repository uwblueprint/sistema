import { Button } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

export function SignInButton(): JSX.Element {
  return (
    <Button
      variant="outline"
      borderColor="primaryBlue.300"
      colorScheme="gray"
      width="275px"
      height="45px"
      color="text"
      leftIcon={<FcGoogle fontSize="18px" />}
      onClick={() => signIn('google', { callbackUrl: `/calendar` })}
    >
      Sign in with Google
    </Button>
  );
}
