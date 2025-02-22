import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { SignOutButton } from '../components/SignOutButton';
import { Image } from '@chakra-ui/react';

interface UserData {
  absences: Array<any>;
}

interface GlobalSettings {
  absenceCap: number;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const [absenceCap, setAbsenceCap] = useState<number | null>(null);
  const [usedAbsences, setUsedAbsences] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session || !session.user || !session.user.email) return;

      const email = session.user.email;
      const absencesUrl = `/api/users/email/${email}?shouldIncludeAbsences=true`;
      const settingsUrl = '/api/settings';

      try {
        const [userResponse, settingsResponse] = await Promise.all([
          fetch(absencesUrl),
          fetch(settingsUrl),
        ]);

        if (!userResponse.ok || !settingsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const userData: UserData = await userResponse.json();
        const settings: GlobalSettings = await settingsResponse.json();

        setAbsenceCap(settings.absenceCap);
        setUsedAbsences(userData.absences.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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
            Absences: {usedAbsences} / {absenceCap}
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
