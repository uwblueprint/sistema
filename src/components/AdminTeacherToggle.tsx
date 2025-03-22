import { Box, Button, ButtonGroup, useToken } from '@chakra-ui/react';
import { IoBuildSharp, IoSchool } from 'react-icons/io5';

interface AdminTeacherToggleProps {
  isAdminMode: boolean;
  onToggle: (mode: 'admin' | 'teacher') => void;
}

export const AdminTeacherToggle: React.FC<AdminTeacherToggleProps> = ({
  isAdminMode,
  onToggle,
}) => {
  return (
    <Box
      position="relative"
      width="300px"
      height="40px"
      borderRadius="8px"
      border="1px solid"
      borderColor="neutralGray.300"
      transition="background-color 0.2s ease"
    >
      <Box
        position="absolute"
        top="50%"
        transform="translateY(-50%)"
        left={isAdminMode ? '152px' : '2px'}
        width="144px"
        height="34px"
        bg="primaryBlue.50"
        borderRadius="6px"
        transition="left 0.3s ease"
      />
      <ButtonGroup
        isAttached
        variant="ghost"
        width="100%"
        height="100%"
        position="relative"
        size="sm"
      >
        <Button
          onClick={() => onToggle('teacher')}
          width="50%"
          height="100%"
          borderTopLeftRadius="8px"
          borderBottomLeftRadius="8px"
          borderTopRightRadius="0"
          borderBottomRightRadius="0"
          leftIcon={<IoSchool fontSize="22px" />}
          color={!isAdminMode ? 'primaryBlue.300' : 'text.subtitle'}
          _active={{ bg: 'transparent' }}
          _hover={{ bg: 'transparent', color: 'primaryBlue.300' }}
        >
          Teacher
        </Button>
        <Button
          onClick={() => onToggle('admin')}
          width="50%"
          height="100%"
          borderTopRightRadius="8px"
          borderBottomRightRadius="8px"
          borderTopLeftRadius="0"
          borderBottomLeftRadius="0"
          leftIcon={<IoBuildSharp fontSize="22px" />}
          color={isAdminMode ? 'primaryBlue.300' : 'text.subtitle'}
          _active={{ bg: 'transparent' }}
          _hover={{ bg: 'transparent', color: 'primaryBlue.300' }}
        >
          Admin
        </Button>
      </ButtonGroup>
    </Box>
  );
};
