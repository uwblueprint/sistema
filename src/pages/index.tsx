import { SignInButton } from '../components/SignInButton';
import { SignOutButton } from '../components/SignOutButton';
import { useSession } from 'next-auth/react';

export default function Index() {
  const session = useSession();
  return (
    <>
      <SignInButton />
      <br />
      <SignOutButton />
      <br />
      <pre className="py-6 px-4 whitespace-pre-wrap break-all">
        {JSON.stringify(session, null, 2)}
      </pre>
    </>
  );
}
