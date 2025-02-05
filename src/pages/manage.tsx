import { useEffect, useState } from 'react';
import { User } from '../types/types';

export default function ManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const apiUrl = `/api/users?getMailingLists=true`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const users: User[] = await response.json();
        setUsers(users);
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

  const updateUserRole = async (userId: number, newRole: string) => {
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

  return (
    <div>
      <h1>Admin Management</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Email Subscriptions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td>
                  {user.mailingLists
                    ?.map((mailingList) => mailingList.mailingList.name)
                    .join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
