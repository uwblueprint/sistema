import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserData {
  id?: number;
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
            `/api/users/email/${session.user.email}?getAbsences=true`
          );
          const data = await res.json();
          setUserData({
            id: data.id, // Include the user's ID
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
