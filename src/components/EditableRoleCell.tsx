import {
  Box,
  Button,
  Icon,
  Text,
  useTheme,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi';
import { IoCheckmark, IoCloseOutline } from 'react-icons/io5';

type EditableRoleCellProps = {
  role: string;
  onRoleChange: (newRole: string) => void;
};

const EditableRoleCell = ({ role, onRoleChange }: EditableRoleCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState(role);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const {
    isOpen: isButtonsOpen,
    onOpen: onButtonsOpen,
    onClose: onButtonsClose,
  } = useDisclosure();

  // Synchronize the popovers
  useEffect(() => {
    if (isEditing) {
      onButtonsOpen();
    } else {
      onButtonsClose();
    }
  }, [isEditing, onButtonsOpen, onButtonsClose]);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsHovered(false);
  };

  const handleRoleChange = (selectedRole: string) => {
    setNewRole(selectedRole);
  };

  const handleConfirmClick = () => {
    onRoleChange(newRole);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setNewRole(role);
    setIsEditing(false);
  };

  const oppositeRole = newRole === 'TEACHER' ? 'ADMIN' : 'TEACHER';

  return (
    <Box
      position="relative"
      display="inline-flex"
      alignItems="center"
      onMouseEnter={() => !isEditing && setIsHovered(true)}
      onMouseLeave={() => !isEditing && setIsHovered(false)}
    >
      <Popover
        isOpen={isEditing}
        onClose={() => {
          // Prevent auto-closing the popovers when buttons are clicked
          if (!isButtonsOpen) {
            setIsEditing(false);
            setNewRole(role);
          }
        }}
        closeOnBlur={false}
        placement="bottom"
        gutter={2}
      >
        <PopoverTrigger>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor="pointer"
            onClick={handleEditClick}
            bg={
              isEditing
                ? 'primaryBlue.50'
                : isHovered
                  ? 'neutralGray.100'
                  : 'transparent'
            }
            p={2}
            borderRadius="md"
            width="100px"
          >
            <Text textStyle="cellBody" flexGrow={1}>
              {newRole === 'TEACHER' ? 'Teacher' : 'Admin'}
            </Text>

            <Box display="flex" alignItems="center">
              {isEditing ? (
                <Icon as={FiChevronUp} color="neutralGray.600" />
              ) : (
                isHovered && <Icon as={FiEdit2} color="neutralGray.600" />
              )}
            </Box>
          </Box>
        </PopoverTrigger>

        <PopoverContent
          width="100px"
          p={0}
          borderRadius="md"
          shadow="md"
          border="1px solid"
          borderColor="neutralGray.300"
          _focus={{ boxShadow: 'none', outline: 'none' }}
        >
          <Box
            p={2}
            cursor="pointer"
            borderRadius="md"
            _hover={{ bg: 'neutralGray.100' }}
            onClick={() => handleRoleChange(oppositeRole)}
          >
            <Text textStyle="cellBody" flexGrow={1}>
              {oppositeRole === 'TEACHER' ? 'Teacher' : 'Admin'}
            </Text>
          </Box>
        </PopoverContent>
      </Popover>

      {isEditing && (
        <Popover
          isOpen={isButtonsOpen}
          placement="right"
          closeOnBlur={false}
          // offset={[10, 0]}
        >
          <PopoverTrigger>
            <Box position="absolute" right="0" opacity="0" />
          </PopoverTrigger>
          <PopoverContent
            width="auto"
            p={0}
            borderRadius="md"
            shadow="md"
            border="1px solid"
            borderColor="neutralGray.300"
            _focus={{ boxShadow: 'none', outline: 'none' }}
          >
            {newRole !== role ? (
              <HStack spacing={0}>
                <Button
                  variant="outline"
                  onClick={handleCancelClick}
                  size="sm"
                  // borderRadius="0 md md 0"
                  p={0}
                >
                  <IoCloseOutline
                    size={20}
                    color={theme.colors.neutralGray[600]}
                  />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleConfirmClick}
                  size="sm"
                  borderRadius="md 0 0 md"
                  p={0}
                  borderRight="none"
                >
                  <IoCheckmark
                    size={20}
                    color={theme.colors.neutralGray[600]}
                  />
                </Button>
              </HStack>
            ) : (
              <Button
                variant="outline"
                onClick={handleCancelClick}
                size="sm"
                borderRadius="md"
                p={0}
              >
                <IoCloseOutline
                  size={20}
                  color={theme.colors.neutralGray[600]}
                />
              </Button>
            )}
          </PopoverContent>
        </Popover>
      )}
    </Box>
  );
};

export default EditableRoleCell;
