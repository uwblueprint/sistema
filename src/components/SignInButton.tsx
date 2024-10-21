// importing from next-auth/react instead of our root's auth.ts because of Client & Server component issues.
// https://authjs.dev/getting-started/session-management/login
import { signIn } from 'next-auth/react';
import { Button } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

export function SignInButton() {
  return (
    <Button
      variant="outline"
      borderColor="blue.400"
      colorScheme="gray"
      width="275px"
      height="45px"
      color="black"
      fontWeight="bold"
      leftIcon={<FcGoogle fontSize="18px" />}
      onClick={() => signIn('google', { callbackUrl: `/homepage` })}
    >
      Sign in with Google
    </Button>
  );
}
