import React, { useEffect, useState } from 'react';
import { User, UserManagementTable } from '../components/UserManagementTable';
import { Box, Spinner } from '@chakra-ui/react';
import { Role } from '../components/UserManagementTable';

export default function AnotherPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const apiUrl = `/api/users?getAbsences=true`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching users:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateUserRole = async (userId: number, newRole: Role) => {
    const confirmed = window.confirm('Confirm change role to ' + newRole);
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
    <UserManagementTable users={users} updateUserRole={updateUserRole} />
  );
}
