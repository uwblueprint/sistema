import React from 'react';
import {
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  Text,
  Avatar,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { signOut } from 'next-auth/react';

// Helper to color-code the "X/Y Absences Taken"
const getAbsenceColor = (usedAbsences: number) => {
  if (usedAbsences <= 6) return 'green.500';
  if (usedAbsences <= 8) return 'yellow.500';
  return 'red.500';
};

interface UserData {
  name: string;
  email: string;
  image?: string;
  usedAbsences: number;
  numOfAbsences: number;
}

interface ProfileMenuProps {
  userData?: UserData;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ userData }) => {
  const absenceColor = userData
    ? getAbsenceColor(userData.usedAbsences)
    : 'gray.500';

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={
          <Avatar
            name={userData?.name ?? 'User'}
            src={userData?.image}
            size="sm"
          />
        }
        variant="ghost"
        aria-label="Open profile menu"
        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
      />
      <MenuList
        minW="280px"
        p="2rem"
        textAlign="center"
        boxShadow="lg"
        borderRadius="md"
      >
        <Text fontSize="2xl" fontWeight="semibold" mb={1}>
          Hi, {userData?.name}!
        </Text>
        <Text fontSize="sm" color="gray.500" mb={3}>
          {userData?.email}
        </Text>
        <Avatar
          name={userData?.name ?? 'User'}
          src={userData?.image}
          size="xl"
          mx="auto"
          mb={3}
        />
        <Text fontSize="md" mb={4}>
          <Text as="span" fontWeight="bold" color={absenceColor}>
            {userData?.usedAbsences}/{userData?.numOfAbsences}
          </Text>{' '}
          Absences Taken
        </Text>
        <Button
          onClick={() => signOut()}
          variant="outline"
          borderColor="gray.300"
          borderRadius="md"
          size="md"
          width="100%"
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
        >
          Log Out
        </Button>
      </MenuList>
    </Menu>
  );
};

export default ProfileMenu;
