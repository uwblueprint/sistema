import { Role, UserData } from '@utils/types';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { getSelectedYearAbsences } from '@utils/getSelectedYearAbsences';

interface UseUserDataReturn extends UserData {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useUserData = (): UseUserDataReturn & {
  refetchUserData: () => void;
} => {
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

  const fetchUser = useCallback(async () => {
    if (status === 'authenticated' && session?.user?.id) {
      try {
        const res = await fetch(
          `/api/users/${session.user.id}?getAbsences=true`
        );
        if (!res.ok) throw new Error('Failed to fetch user');
        const user = await res.json();

        const today = new Date();
        const currentYear =
          today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
        const selectedYearRange = `${currentYear} - ${currentYear + 1}`;

        setFetchedUserData({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          image: user.profilePicture ?? undefined,
          role: user.role as Role,
          usedAbsences: getSelectedYearAbsences(
            user.absences,
            selectedYearRange
          ),
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    id: fetchedUserData?.id ?? 0,
    name: fetchedUserData?.name ?? '',
    email: fetchedUserData?.email ?? '',
    image: fetchedUserData?.image,
    role: fetchedUserData?.role ?? Role.TEACHER,
    usedAbsences: fetchedUserData?.usedAbsences ?? 0,
    isAuthenticated: status === 'authenticated',
    isLoading,
    refetchUserData: fetchUser,
  };
};
