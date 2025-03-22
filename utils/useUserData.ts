import { useMemo } from 'react';
import { useSession } from 'next-auth/react';

export const useUserData = () => {
  const { data: session, status } = useSession();

  const userData = useMemo(() => {
    return {
      name: session?.user?.name ?? '',
      email: session?.user?.email ?? '',
      image: session?.user?.image ?? undefined,
      numOfAbsences: session?.user?.absenceCap ?? 0,
      usedAbsences: session?.user?.usedAbsences ?? 0,
      id: session?.user?.id,
      role: session?.user?.role,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
    };
  }, [session, status]);

  return userData;
};
