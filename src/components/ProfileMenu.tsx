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
function getAbsenceColor(usedAbsences: number) {
  if (usedAbsences <= 6) return 'green.500';
  if (usedAbsences <= 8) return 'yellow.500';
  return 'red.500';
}

// Same interface as used in CalendarHeader, or define your own
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
        minW="280px" // Make the pop-up larger
        p="2rem" // Add some padding
        textAlign="center"
        boxShadow="lg"
        borderRadius="md"
      >
        {/* Title: "Hi, [Name]!" in 2xl */}
        <Text fontSize="2xl" fontWeight="semibold" mb={1}>
          Hi, {userData?.name}!
        </Text>
        {/* Email below the title */}
        <Text fontSize="sm" color="gray.500" mb={3}>
          {userData?.email}
        </Text>
        {/* Larger avatar below the email */}
        <Avatar
          name={userData?.name ?? 'User'}
          src={userData?.image}
          size="xl"
          mx="auto"
          mb={3}
        />
        {/* Absences Taken: e.g. "4/10" in color */}
        <Text fontSize="md" mb={4}>
          <Text as="span" fontWeight="bold" color={absenceColor}>
            {userData?.usedAbsences}/{userData?.numOfAbsences}
          </Text>{' '}
          Absences Taken
        </Text>
        {/* Log Out button: white background, gray border */}
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
