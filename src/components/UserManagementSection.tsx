import { Box, Spinner } from '@chakra-ui/react';
import { Role } from '@utils/types';
import { UserAPI, MailingList } from '../types/apiTypes';
import { useEffect, useState } from 'react';
import { UserManagementTable } from './UserManagementTable';

const UserManagementSection = () => {
  const [users, setUsers] = useState<UserAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [absenceCap, setAbsenceCap] = useState<number>(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch(
          '/api/users?getAbsences=true&getMailingLists=true'
        );
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Fetch settings
        const settingsResponse = await fetch('/api/settings');
        if (!settingsResponse.ok) throw new Error('Failed to fetch settings');
        const settings = await settingsResponse.json();
        setAbsenceCap(settings.absenceCap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateUserRole = async (userId: number, newRole: Role) => {
    const confirmed = window.confirm(`Confirm change role to ${newRole}`);
    if (!confirmed) return;

    const apiUrl = `/api/users/${userId}`;
    const originalUsers = [...users];

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        setUsers(originalUsers);
        throw new Error(response.statusText);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating user:', error.message);
      }
    }
  };

  const updateUserSubscriptions = async (
    userId: number,
    subjectIds: number[]
  ) => {
    const apiUrl = `/api/users/${userId}/mailingLists`;
    const originalUsers = [...users];

    // Optimistically update the UI
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === userId) {
          // Create updated mailing lists based on selected subject IDs
          const updatedMailingLists = subjectIds.map((subjectId) => {
            // Find the subject in existing mailing lists or create a new entry
            const existingList = user.mailingLists?.find((list) => {
              // Safely access the id property
              const subjectIdFromList =
                list.subject &&
                typeof list.subject === 'object' &&
                'id' in list.subject
                  ? list.subject.id
                  : undefined;

              return subjectIdFromList === subjectId;
            });

            if (existingList) return existingList;

            // If this is a new subject, try to find it in another user's mailing lists for its details
            const subjectDetails = users
              .flatMap((u) => u.mailingLists || [])
              .find((list) => {
                // Safely access the id property
                const subjectIdFromList =
                  list.subject &&
                  typeof list.subject === 'object' &&
                  'id' in list.subject
                    ? list.subject.id
                    : undefined;

                return subjectIdFromList === subjectId;
              })?.subject;

            if (subjectDetails) {
              return {
                subject: subjectDetails,
              };
            }

            // Fallback with minimal information if subject details not found
            return {
              subject: {
                id: subjectId,
                name: `Subject ${subjectId}`,
                colorGroup: {
                  colorCodes: ['#000000', '#000000', '#000000', '#EEEEEE'],
                },
              },
            };
          });

          return { ...user, mailingLists: updatedMailingLists };
        }
        return user;
      })
    );

    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjectIds }),
      });

      if (!response.ok) {
        // Revert to original state if the API call fails
        setUsers(originalUsers);
        throw new Error(response.statusText);
      }

      // If successful, fetch the updated user to ensure UI is in sync with database
      const updatedMailingListsResponse = await fetch(apiUrl);
      if (updatedMailingListsResponse.ok) {
        const updatedMailingLists = await updatedMailingListsResponse.json();

        // Update the user with the accurate mailing lists from the server
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, mailingLists: updatedMailingLists }
              : user
          )
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating user subscriptions:', error.message);
      }
    }
  };

  return loading ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Spinner />
    </Box>
  ) : (
    <UserManagementTable
      users={users}
      updateUserRole={updateUserRole}
      updateUserSubscriptions={updateUserSubscriptions}
      absenceCap={absenceCap}
    />
  );
};

export default UserManagementSection;
