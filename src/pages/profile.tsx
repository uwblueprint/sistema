import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { SignOutButton } from '../components/SignOutButton';
import { Image } from '@chakra-ui/react';

interface UserData {
  numOfAbsences: number;
  absences: Array<any>;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const [numAbsences, setNumAbsences] = useState<number | null>(null);
  const [usedAbsences, setUsedAbsences] = useState<number | null>(null);
  useEffect(() => {
    const fetchUserDataByEmail = async () => {
      if (!session || !session.user || !session.user.email) return;

      const email = session.user.email;
      const apiUrl = `/api/users/email/${email}?shouldIncludeAbsences=true`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data: UserData = await response.json();
        setNumAbsences(data.numOfAbsences);
        setUsedAbsences(data.absences.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserDataByEmail();
  }, [session]);

  return (
    <div>
      <h1>Profile</h1>
      <hr />
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : session && session.user ? (
        <div>
          <h2>Personal Information</h2>
          <p>Name: {session.user.name}</p>
          <p>Email: {session.user.email}</p>
          <p>Image:</p>
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="User Image"
              referrerPolicy="no-referrer"
            />
          )}
          <hr />
          <h2>Metrics</h2>
          <p>
            Absences: {usedAbsences} / {numAbsences}
          </p>
          <hr />
        </div>
      ) : (
        <p>Error: Signed out</p>
      )}
      <hr />
      <SignOutButton />
    </div>
  );
}
