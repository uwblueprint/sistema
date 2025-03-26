import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { UserData, Role } from '@utils/types';

interface UseUserDataReturn extends UserData {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useUserData = (): UseUserDataReturn => {
  const { data: session, status } = useSession();
  const [fetchedUserData, setFetchedUserData] = useState<null | {
    id: number;
    name: string;
    email: string;
    image?: string;
    role: Role;
    usedAbsences: number;
  }>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const res = await fetch(
            `/api/users/${session.user.id}?getAbsences=true`
          );
          if (!res.ok) throw new Error('Failed to fetch user');
          const user = await res.json();

          setFetchedUserData({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            image: user.profilePicture ?? undefined,
            role: user.role as Role,
            usedAbsences: user.absences.length,
          });
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (status !== 'loading') {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [status, session?.user?.id]);

  return {
    id: fetchedUserData?.id ?? 0,
    name: fetchedUserData?.name ?? '',
    email: fetchedUserData?.email ?? '',
    image: fetchedUserData?.image,
    role: fetchedUserData?.role ?? (Role.TEACHER as Role),
    usedAbsences: fetchedUserData?.usedAbsences ?? 0,
    isAuthenticated: status === 'authenticated',
    isLoading,
  };
};
