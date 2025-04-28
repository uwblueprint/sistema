import {
  Box,
  HStack,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  useOutsideClick,
  useTheme,
} from '@chakra-ui/react';
import { Role } from '@utils/types';
import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi';
import { IoCheckmark, IoCloseOutline } from 'react-icons/io5';

type EditableRoleCellProps = {
  role: Role;
  onRoleChange: (newRole: Role) => void;
};

const EditableRoleCell = ({ role, onRoleChange }: EditableRoleCellProps) => {
  const [newRole, setNewRole] = useState<Role>(role);
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isOpen: isButtonsOpen,
    onOpen: onButtonsOpen,
    onClose: onButtonsClose,
  } = useDisclosure();

  useOutsideClick({
    ref: containerRef,
    handler: () => {
      if (isEditing) {
        setIsEditing(false);
        setIsDropdownOpen(false);
        setNewRole(role);
        onButtonsClose();
      }
    },
  });

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

  const handleDropdownToggle = () => {
    if (isEditing) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleRoleChange = (selectedRole: Role) => {
    setNewRole(selectedRole);
    setIsDropdownOpen(false);
  };

  const handleConfirmClick = () => {
    onRoleChange(newRole);
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  const handleCancelClick = () => {
    setNewRole(role);
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  const oppositeRole = newRole === Role.TEACHER ? Role.ADMIN : Role.TEACHER;

  return (
    <Box
      position="relative"
      display="inline-flex"
      alignItems="center"
      onMouseEnter={() => !isEditing && setIsHovered(true)}
      onMouseLeave={() => !isEditing && setIsHovered(false)}
      ref={containerRef}
    >
      <Popover
        isOpen={isDropdownOpen}
        onClose={() => {
          // Prevent auto-closing the popovers when buttons are clicked
          if (!isButtonsOpen) {
            setIsDropdownOpen(false);
          }
        }}
        closeOnBlur={false}
        placement="bottom"
        gutter={1}
        isLazy
      >
        <PopoverTrigger>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor="pointer"
            onClick={isEditing ? handleDropdownToggle : handleEditClick}
            bg={
              isEditing
                ? 'primaryBlue.50'
                : isHovered
                  ? 'neutralGray.100'
                  : 'transparent'
            }
            p={2}
            borderRadius="5px"
            width="100px"
            transition="background-color 0.3s ease-in-out"
          >
            <Text textStyle="cellBody" flexGrow={1}>
              {newRole === Role.TEACHER ? 'Teacher' : 'Admin'}
            </Text>

            <Box display="flex" alignItems="center">
              {isEditing ? (
                <Icon
                  as={isDropdownOpen ? FiChevronUp : FiChevronDown}
                  color="neutralGray.600"
                />
              ) : (
                <Icon
                  as={FiEdit2}
                  color="neutralGray.600"
                  opacity={isHovered ? 1 : 0}
                  transition="opacity 0.3s ease-in-out"
                />
              )}
            </Box>
          </Box>
        </PopoverTrigger>

        <PopoverContent
          width="100px"
          p={0}
          shadow="md"
          border="1px solid"
          borderColor="neutralGray.300"
          _focus={{ boxShadow: 'md' }}
        >
          <Box
            p={2}
            cursor="pointer"
            borderRadius="5px"
            _hover={{ bg: 'neutralGray.100' }}
            _active={{ bg: 'neutralGray.300' }}
            onClick={() => handleRoleChange(oppositeRole)}
          >
            <Text textStyle="cellBody" flexGrow={1}>
              {oppositeRole === Role.TEACHER ? 'Teacher' : 'Admin'}
            </Text>
          </Box>
        </PopoverContent>
      </Popover>

      {isEditing && (
        <Popover
          isOpen={isButtonsOpen}
          placement="right"
          closeOnBlur={false}
          isLazy
        >
          <PopoverTrigger>
            <Box position="absolute" right="0" opacity="0" />
          </PopoverTrigger>
          <PopoverContent
            width="auto"
            p={0}
            _focus={{ boxShadow: 'none', outline: 'none' }}
            border="none"
          >
            <HStack
              spacing={0}
              boxShadow="0px 0px 10px 0px rgba(0, 0, 0, 0.15)"
              borderRadius="5px"
            >
              <Box
                p={1}
                cursor="pointer"
                _hover={{ bg: 'neutralGray.100' }}
                _active={{ bg: 'neutralGray.300' }}
                borderRadius={newRole !== role ? '5px 0 0 5px' : '5px'}
                onClick={handleCancelClick}
              >
                <IoCloseOutline
                  size={24}
                  color={theme.colors.neutralGray[600]}
                />
              </Box>
              {newRole !== role && (
                <Box
                  p={1}
                  cursor="pointer"
                  _hover={{ bg: 'neutralGray.100' }}
                  _active={{ bg: 'neutralGray.300' }}
                  borderRadius="0 5px 5px 0"
                  onClick={handleConfirmClick}
                >
                  <IoCheckmark
                    size={24}
                    color={theme.colors.neutralGray[600]}
                  />
                </Box>
              )}
            </HStack>
          </PopoverContent>
        </Popover>
      )}
    </Box>
  );
};

export default EditableRoleCell;
