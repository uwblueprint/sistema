import React, { useState } from 'react';
import { Box, Button, Icon, Text, useTheme } from '@chakra-ui/react';
import { IoCheckmark, IoCloseOutline } from 'react-icons/io5';
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi';

type EditableRoleCellProps = {
  role: string;
  onRoleChange: (newRole: string) => void;
};

const EditableRoleCell = ({ role, onRoleChange }: EditableRoleCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newRole, setNewRole] = useState(role);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  const handleEditClick = () => {
    setIsEditing(true);
    setIsDropdownOpen(false);
    setIsHovered(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleRoleChange = (selectedRole: string) => {
    setNewRole(selectedRole);
    setIsDropdownOpen(false);
  };

  const handleConfirmClick = () => {
    onRoleChange(newRole);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setNewRole(role);
    setIsEditing(false);
    setIsHovered(false);
    setIsDropdownOpen(false);
  };

  const oppositeRole = newRole === 'TEACHER' ? 'ADMIN' : 'TEACHER';

  return (
    <Box
      position="relative"
      display="inline-flex"
      alignItems="center"
      onMouseEnter={() => !isEditing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        cursor="pointer"
        onClick={handleEditClick}
        bg={isEditing ? 'primaryBlue.50' : 'transparent'}
        p={2}
        borderRadius="md"
        width="100px"
      >
        <Text textStyle="cellBody" flexGrow={1}>
          {newRole === 'TEACHER' ? 'Teacher' : 'Admin'}
        </Text>

        <Box display="flex" alignItems="center">
          {isEditing ? (
            <Icon
              as={isDropdownOpen ? FiChevronUp : FiChevronDown}
              color="neutralGray.600"
              onClick={toggleDropdown}
            />
          ) : (
            isHovered && <Icon as={FiEdit2} color="neutralGray.600" />
          )}
        </Box>
      </Box>

      {isDropdownOpen && (
        <Box
          position="absolute"
          top="38px"
          left="0"
          bg="white"
          border="1px solid"
          borderColor="neutralGray.300"
          borderRadius="md"
          shadow="md"
          zIndex="10"
          width="100px"
        >
          <Box
            p={2}
            cursor="pointer"
            borderRadius="md"
            _hover={{ bg: 'primaryBlue.50' }}
            onClick={() => handleRoleChange(oppositeRole)}
          >
            <Text textStyle="cellBody" flexGrow={1}>
              {oppositeRole === 'TEACHER' ? 'Teacher' : 'Admin'}
            </Text>
          </Box>
        </Box>
      )}

      {isEditing && newRole !== role && (
        <Button
          variant="outline"
          onClick={handleConfirmClick}
          position="absolute"
          right={'-70px'}
          size="sm"
          borderRadius="md"
          p={0}
        >
          <IoCheckmark size={20} color={theme.colors.neutralGray[600]} />
        </Button>
      )}

      {isEditing && (
        <Button
          variant="outline"
          onClick={handleCancelClick}
          position="absolute"
          right={'-35px'}
          size="sm"
          borderRadius="md"
          p={0}
        >
          <IoCloseOutline size={20} color={theme.colors.neutralGray[600]} />
        </Button>
      )}
    </Box>
  );
};

export default EditableRoleCell;
