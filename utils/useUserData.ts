import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserData {
  name: string;
  email: string;
  image?: string;
  usedAbsences: number;
  numOfAbsences: number;
}

const useUserData = () => {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(
            `/api/users/email/${session.user.email}?shouldIncludeAbsences=true`
          );
          const data = await res.json();
          setUserData({
            name: session.user.name ?? '',
            email: session.user.email,
            image: session.user.image ?? undefined,
            numOfAbsences: data.numOfAbsences,
            usedAbsences: data.absences?.length ?? 0,
          });
        } catch (err) {
          console.error('Could not fetch user data:', err);
          setUserData(undefined);
        }
      }
    };
    fetchUserData();
  }, [session]);

  return userData;
};

export default useUserData;
