import { Box, useDisclosure } from '@chakra-ui/react';
import { MailingList, Role, SubjectAPI, UserAPI } from '@utils/types';
import { useCallback, useEffect, useState } from 'react';
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

  // Define fetchData function with useCallback to allow it to be stable
  const fetchData = useCallback(async () => {
    try {
      // Fetch all subjects first
      const subjectsResponse = await fetch('/api/subjects');
      if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects');
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);

      const usersResponse = await fetch(
        '/api/users?getAbsences=true&getMailingLists=true'
      );
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData: UserAPI[] = await usersResponse.json();

      const usersWithSortedLists = usersData.map((u) => ({
        ...u,
        mailingLists: sortMailingLists(u.mailingLists || []),
      }));
      setUsers(usersWithSortedLists);

      const settingsResponse = await fetch('/api/settings');
      if (!settingsResponse.ok) throw new Error('Failed to fetch settings');
      const settings = await settingsResponse.json();
      setAbsenceCap(settings.absenceCap);
    } catch (error) {
      console.error('Error fetching data:', error);
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
        setUsers(originalUsers);
        throw new Error(response.statusText);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating user:', error.message);
      }
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

    // Get the complete subject objects for all selected subject IDs
    const updatedMailingLists = subjectIds.map((subjectId) => {
      // Find this subject in our subjects list
      const subjectData = subjects.find((s) => s.id === subjectId);

      // Find existing mailing list for this subject if it exists
      const existingMailingList = user.mailingLists?.find(
        (ml) => ml.subject.id === subjectId
      );

      // If it exists, keep its data
      if (existingMailingList) {
        return existingMailingList;
      }

      // Otherwise create a new entry with full subject data
      return {
        userId: userId,
        subjectId: subjectId,
        user: user,
        subject: subjectData || user.mailingLists?.[0]?.subject || null,
      };
    });

    // Optimistically update UI with complete data
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId ? { ...u, mailingLists: updatedMailingLists } : u
      )
    );

    // Make the API call in the background
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mailingListSubjectIds: subjectIds }),
      });

      if (!response.ok) {
        // Restore original state on error
        setUsers(originalUsers);
        throw new Error(response.statusText);
      }

      // Skip refreshing data - our optimistic update is already using complete data
      // The server response should match what we've already rendered
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating user subscriptions:', error.message);
      }
      setUsers(originalUsers);
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
