import { Box, useDisclosure } from '@chakra-ui/react';
import { MailingList, Role, SubjectAPI, UserAPI } from '@utils/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCustomToast } from '../../CustomToast';
import ConfirmRoleChangeModal from './ConfirmRoleChangeModal';
import { UserManagementTable } from './UserManagementTable';

interface UserManagementCardProps {
  setRefreshFunction?: (refreshFn: () => void) => void;
  selectedYearRange: string;
}

const UserManagementCard: React.FC<UserManagementCardProps> = ({
  setRefreshFunction,
  selectedYearRange,
}) => {
  const [users, setUsers] = useState<UserAPI[]>([]);
  const [subjects, setSubjects] = useState<SubjectAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [absenceCap, setAbsenceCap] = useState<number>(10);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingUser, setPendingUser] = useState<UserAPI | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const showToast = useCustomToast();
  const toastRef = useRef(showToast);

  // Define fetchData function with useCallback to allow it to be stable
  const fetchData = useCallback(async () => {
    try {
      const subjectsResponse = await fetch('/api/subjects');
      if (!subjectsResponse.ok) {
        const errorData = await subjectsResponse.json().catch(() => null);
        const errorMessage = errorData?.error
          ? `Failed to fetch subjects: ${errorData.error}`
          : `Failed to fetch subjects: ${subjectsResponse.statusText}`;
        throw new Error(errorMessage);
      }
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);

      const usersResponse = await fetch(
        '/api/users?getAbsences=true&getMailingLists=true'
      );
      if (!usersResponse.ok) {
        const errorData = await usersResponse.json().catch(() => null);
        const errorMessage = errorData?.error
          ? `Failed to fetch users: ${errorData.error}`
          : `Failed to fetch users: ${usersResponse.statusText}`;
        throw new Error(errorMessage);
      }
      const usersData: UserAPI[] = await usersResponse.json();
      const usersWithSortedLists = usersData.map((u) => ({
        ...u,
        mailingLists: sortMailingLists(u.mailingLists || []),
      }));
      setUsers(usersWithSortedLists);

      const settingsResponse = await fetch('/api/settings');
      if (!settingsResponse.ok) {
        const errorData = await settingsResponse.json().catch(() => null);
        const errorMessage = errorData?.error
          ? `Failed to fetch settings: ${errorData.error}`
          : `Failed to fetch settings: ${settingsResponse.statusText}`;
        throw new Error(errorMessage);
      }
      const settings = await settingsResponse.json();
      setAbsenceCap(settings.absenceCap);
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Error fetching data: ${error.message}`
        : 'Error fetching data.';
      console.error(errorMessage, error);

      toastRef.current({
        description: errorMessage,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Register our fetchData function with the parent component
  useEffect(() => {
    if (setRefreshFunction) {
      setRefreshFunction(fetchData);
    }
  }, [setRefreshFunction, fetchData]);

  const handleConfirmRoleChange = (userId: number, newRole: Role) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setPendingUser(user);
    setPendingRole(newRole);
    onOpen();
  };

  const confirmUpdateUserRole = async () => {
    if (!pendingUser || !pendingRole) return;

    const apiUrl = `/api/users/${pendingUser.id}`;
    const originalUsers = [...users];

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === pendingUser.id ? { ...user, role: pendingRole } : user
      )
    );

    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: pendingRole }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error
          ? `Failed to update user role: ${errorData.error}`
          : `Failed to update user role: ${response.statusText || 'Unknown error'}`;

        setUsers(originalUsers);
        console.error(errorMessage);
        toastRef.current({
          description: errorMessage,
          status: 'error',
        });
        return;
      }
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to update user role: ${error.message}`
        : 'Failed to update user role.';
      setUsers(originalUsers);
      console.error(errorMessage, error);

      toastRef.current({
        description: errorMessage,
        status: 'error',
      });
    } finally {
      onClose();
      setPendingUser(null);
      setPendingRole(null);
    }
  };

  // Utility function to sort mailing lists
  const sortMailingLists = (lists: MailingList[]) => {
    return [...lists].sort((a, b) => {
      // First sort by archived status (unarchived first)
      if (a.subject.archived !== b.subject.archived) {
        return a.subject.archived ? 1 : -1;
      }
      // Then sort by ID
      return a.subject.id - b.subject.id;
    });
  };

  const updateUserSubscriptions = async (
    userId: number,
    subjectIds: number[]
  ) => {
    const originalUsers = [...users];
    const user = users.find((u) => u.id === userId);

    if (!user) return;

    const updatedMailingLists = subjectIds.map((subjectId) => {
      const subjectData = subjects.find((s) => s.id === subjectId);
      const existingMailingList = user.mailingLists?.find(
        (ml) => ml.subject.id === subjectId
      );

      if (existingMailingList) {
        return existingMailingList;
      }

      return {
        userId: userId,
        subjectId: subjectId,
        user: user,
        subject: subjectData || user.mailingLists?.[0]?.subject || null,
      };
    });

    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId ? { ...u, mailingLists: updatedMailingLists } : u
      )
    );

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mailingListSubjectIds: subjectIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error
          ? `Failed to update subscriptions: ${errorData.error}`
          : `Failed to update subscriptions: ${response.statusText || 'Unknown error'}`;

        setUsers(originalUsers);
        console.error(errorMessage);
        toastRef.current({
          description: errorMessage,
          status: 'error',
        });
        return;
      }
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to update subscriptions: ${error.message}`
        : 'Failed to update subscriptions.';

      setUsers(originalUsers);
      console.error(errorMessage, error);
      toastRef.current({
        description: errorMessage,
        status: 'error',
      });
    }
  };

  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      flex="1"
      minHeight="0"
    >
      <UserManagementTable
        users={users}
        updateUserRole={handleConfirmRoleChange}
        updateUserSubscriptions={updateUserSubscriptions}
        absenceCap={absenceCap}
        allSubjects={subjects}
        selectedYearRange={selectedYearRange}
        isLoading={loading}
      />

      <ConfirmRoleChangeModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmUpdateUserRole}
        pendingUser={pendingUser}
        pendingRole={pendingRole}
      />
    </Box>
  );
};

export default UserManagementCard;
