import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useTheme,
  useToast,
} from '@chakra-ui/react';
import { NEXT_PUBLIC_PROD_URL } from '@utils/config';
import { getAbsenceColor } from '@utils/getAbsenceColor';
import { Role, UserData } from '@utils/types';
import { signOut } from 'next-auth/react';
import { IoLinkOutline } from 'react-icons/io5';

interface ProfileMenuProps {
  userData?: UserData;
  absenceCap;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ userData, absenceCap }) => {
  const absenceColor = userData
    ? getAbsenceColor(userData.usedAbsences, absenceCap)
    : getAbsenceColor(0, absenceCap);
  const theme = useTheme();
  const toast = useToast();

  const handleCopyICal = async () => {
    const iCalURL = `${NEXT_PUBLIC_PROD_URL}/api/ics/calendar.ics`;
    try {
      await navigator.clipboard.writeText(iCalURL);
      toast({
        title: 'Copied!',
        description: 'Sistema iCal URL has been copied to your clipboard.',
        status: 'success',
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyPersonalICal = async () => {
    if (!userData?.id) return;

    const iCalURL = `${NEXT_PUBLIC_PROD_URL}/api/ics/user-${userData.id}.ics`;
    try {
      await navigator.clipboard.writeText(iCalURL);
      toast({
        title: 'Copied!',
        description: 'Personal iCal URL has been copied to your clipboard.',
        status: 'success',
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Menu>
      <MenuButton as="button" aria-label="Open profile menu">
        <Avatar
          name={userData?.name ?? ''}
          src={userData?.image}
          width="40px"
          height="40px"
          loading="eager"
          ignoreFallback
        />
      </MenuButton>
      <MenuList width="280px" p={4} textAlign="center" boxShadow="lg">
        <Avatar
          name={userData?.name ?? ''}
          src={userData?.image}
          width="80px"
          height="80px"
          mb={3}
          loading="eager"
          ignoreFallback
        />
        <Text textStyle="h3">Hi, {userData?.name}!</Text>
        <Text textStyle="caption" color="text.subtitle" mb={4}>
          {userData?.email}
        </Text>
        <Box bg="neutralGray.50" p={3} textAlign="center" mb={3}>
          <Flex justify="center" align="center" gap={2} wrap="wrap">
            <Text textStyle="h4" color={absenceColor}>
              {userData?.usedAbsences}/{absenceCap}
            </Text>
            <Text textStyle="h4">Absences Taken</Text>
          </Flex>
        </Box>

        <HStack spacing={2} align="center" justifyContent="center" mb={4}>
          {userData?.id && (
            <Flex
              alignItems="center"
              gap={2}
              justifyContent="center"
              cursor="pointer"
              onClick={handleCopyPersonalICal}
            >
              <Text textStyle="caption" color="text.subtitle">
                Personal iCal
              </Text>
              <IoLinkOutline size={16} color={theme.colors.neutralGray[600]} />
            </Flex>
          )}
          {userData?.role === Role.ADMIN && (
            <Flex
              alignItems="center"
              gap={2}
              justifyContent="center"
              cursor="pointer"
              onClick={handleCopyICal}
            >
              <Text textStyle="caption" color="text.subtitle">
                Sistema iCal
              </Text>
              <IoLinkOutline size={16} color={theme.colors.neutralGray[600]} />
            </Flex>
          )}
        </HStack>

        <Button
          onClick={() => signOut()}
          variant="outline"
          size="md"
          width="100px"
        >
          Log Out
        </Button>
      </MenuList>
    </Menu>
  );
};

export default ProfileMenu;
