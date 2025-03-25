import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Box,
  useDisclosure,
} from '@chakra-ui/react';
import { Role, UserAPI } from '@utils/types';
import { useEffect, useState } from 'react';
import { UserManagementTable } from './UserManagementTable';

const UserManagementCard = () => {
  const [users, setUsers] = useState<UserAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [absenceCap, setAbsenceCap] = useState<number>(10);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingUser, setPendingUser] = useState<UserAPI | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await fetch(
          '/api/users?getAbsences=true&getMailingLists=true'
        );
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData);

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

  return loading ? null : (
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
        absenceCap={absenceCap}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Role Change</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to change{' '}
              <strong>
                {pendingUser?.firstName} {pendingUser?.lastName}
              </strong>
              &rsquo;s role to <strong>{pendingRole}</strong>?{' '}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={confirmUpdateUserRole}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagementCard;
