import React, { useEffect, useState } from 'react';
import { User, UserManagementTable } from '../components/UserManagementTable';
import { Box, Spinner } from '@chakra-ui/react';
import { Role } from '../components/UserManagementTable';

export default function ManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [absenceCap, setAbsenceCap] = useState<number>(10); // Default value

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/api/users?getAbsences=true');
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
      absenceCap={absenceCap}
    />
  );
}
