import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';

import {
  Avatar,
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useTheme,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';

import { getAbsenceColor } from '@utils/getAbsenceColor';
import { Role, UserAPI } from '@utils/types';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEdit2,
  FiLock,
  FiMail,
  FiSearch,
  FiTag,
  FiUser,
} from 'react-icons/fi';
import { IoCheckmark, IoCloseOutline } from 'react-icons/io5';
import FilterPopup, { FilterOptions } from './FilterPopup';

type EditableRoleCellProps = {
  role: string;
  onRoleChange: (newRole: string) => void;
};

const EditableRoleCell = ({ role, onRoleChange }: EditableRoleCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newRole, setNewRole] = useState(role);
  const [isHovered, setIsHovered] = useState(false);

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
  const theme = useTheme();

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

type SortField = 'name' | 'email' | 'absences' | 'role';

type SortDirection = 'asc' | 'desc';

interface UserManagementTableProps {
  users: UserAPI[];
  updateUserRole: (userId: number, newRole: Role) => void;
  absenceCap: number;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  updateUserRole,
  absenceCap,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterOptions>({
    role: null,
    absencesOperator: 'greater_than',
    absencesValue: null,
    tags: null,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagColors, setTagColors] = useState<Record<string, string[]>>({});

  // Extract unique tags and their colors from users' mailing lists
  useEffect(() => {
    const tags = new Set<string>();
    const colors: Record<string, string[]> = {};

    users.forEach((user: UserAPI) => {
      user.mailingLists?.forEach((list) => {
        const tagName = list.subject.name;
        tags.add(tagName);

        // Store the color codes for each tag
        if (!colors[tagName] && list.subject.colorGroup) {
          colors[tagName] = list.subject.colorGroup.colorCodes;
        }
      });
    });

    setAvailableTags(Array.from(tags));
    setTagColors(colors);
  }, [users]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes from FilterPopup
  const handleFilterChange = (filterOptions: FilterOptions) => {
    setFilters((prev) => ({
      ...prev,
      role: filterOptions.role,
      absencesOperator: filterOptions.absencesOperator,
      absencesValue: filterOptions.absencesValue,
      tags: filterOptions.tags,
    }));
  };

  // Filter users based on search term and other criteria
  const filteredUsers = useMemo(() => {
    return users.filter((user: UserAPI) => {
      const { role, absencesOperator, absencesValue, tags } = filters;

      // Search term filter - only search by name
      if (searchTerm) {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        if (!fullName.includes(searchLower)) {
          return false;
        }
      }

      // Role filter
      if (role && user.role !== role) {
        return false;
      }

      // Absences filter
      if (absencesValue !== null && absencesValue !== undefined) {
        const userAbsences = user.absences?.length || 0;

        switch (absencesOperator) {
          case 'greater_than':
            if (userAbsences <= absencesValue) return false;
            break;
          case 'less_than':
            if (userAbsences >= absencesValue) return false;
            break;
          case 'equal_to':
            if (userAbsences !== absencesValue) return false;
            break;
        }
      }

      // Tags filter
      if (tags && tags.length > 0) {
        const userTags =
          user.mailingLists?.map((list) => list.subject.name) || [];
        // Check if user has at least one of the selected tags
        if (!tags.some((tag) => userTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters, searchTerm]);

  // Sort the filtered users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name': // Right now this is sorting by first name
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          return nameA.localeCompare(nameB) * modifier;

        case 'email':
          return a.email.localeCompare(b.email) * modifier;

        case 'absences':
          return (a.absences.length - b.absences.length) * modifier;

        case 'role':
          return a.role.localeCompare(b.role) * modifier;

        default:
          return 0;
      }
    });
  }, [filteredUsers, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;

    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <Icon
          as={IoChevronUpOutline}
          boxSize={4}
          color={
            isActive && sortDirection === 'asc'
              ? 'primaryBlue.300'
              : 'text.subtitle'
          }
          mb="-3px"
        />
        <Icon
          as={IoChevronDownOutline}
          boxSize={4}
          color={
            isActive && sortDirection === 'desc'
              ? 'primaryBlue.300'
              : 'text.subtitle'
          }
          mt="-3px"
        />
      </Box>
    );
  };

  const SortableHeader = ({
    field,
    label,
    icon,
    centered = false,
  }: {
    field: SortField;
    label: string;
    icon: any;
    centered?: boolean;
  }) => {
    const isActive = sortField === field;
    const color = isActive ? 'primaryBlue.300' : 'text.subtitle';

    return (
      <Th
        onClick={() => handleSort(field)}
        cursor="pointer"
        textAlign={centered ? 'center' : 'left'}
      >
        <HStack spacing={2} justifyContent={centered ? 'center' : 'flex-start'}>
          <Icon as={icon} boxSize={4} color={color} />
          <Text textStyle="h4" color={color} textTransform="none">
            {label}
          </Text>
          <SortIcon field={field} />
        </HStack>
      </Th>
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex="1"
      minHeight="0"
      shadow="sm"
      borderRadius="lg"
      bg="white"
      w="full"
      border="1px solid"
      borderColor="neutralGray.300"
    >
      <HStack justify="space-between" mx={5} my={3}>
        <Text fontSize={'22px'} lineHeight="33px" fontWeight={700}>
          User Management
        </Text>
        <HStack spacing={4}>
          <InputGroup maxW="xs" margin={0}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="neutralGray.600" boxSize={6} />
            </InputLeftElement>
            <Input
              paddingRight={0}
              color="black"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={(e) => {
                e.target.style.width = '270px';
                e.target.style.flex = '1';
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.style.width = '0px';
                  e.target.style.flex = '0';
                }
              }}
              transition="width 0.3s ease"
              width={searchTerm ? '270px' : '0px'}
              margin={0}
            />
          </InputGroup>

          <FilterPopup
            filters={filters}
            setFilters={setFilters}
            availableTags={availableTags}
            tagColors={tagColors}
          />
        </HStack>
      </HStack>
      <Divider />
      <Box overflowX="auto" maxHeight="55vh">
        <Table variant="simple">
          <Thead
            position="sticky"
            top={0}
            zIndex={1}
            bg="white"
            boxShadow="0 1px 1px rgba(227, 227, 227, 1)"
          >
            <Tr borderColor={'red'}>
              <SortableHeader field="name" label="Name" icon={FiUser} />
              <SortableHeader field="email" label="Email" icon={FiMail} />
              <SortableHeader
                field="absences"
                label="Abs."
                icon={FiClock}
                centered
              />
              <SortableHeader field="role" label="Role" icon={FiLock} />
              <Th>
                <HStack spacing={2}>
                  <Icon as={FiTag} boxSize={4} color="text.subtitle" />
                  <Text
                    textStyle="h4"
                    color="text.subtitle"
                    textTransform="none"
                  >
                    Email Subscriptions
                  </Text>
                </HStack>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {sortedUsers.length > 0
              ? sortedUsers.map((user, index) => (
                  <Tr
                    key={index}
                    sx={{
                      ':last-child td': { borderBottom: 'none' },
                    }}
                  >
                    <Td>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={`${user.firstName} ${user.lastName}`}
                          src={user.profilePicture || undefined}
                        />
                        <Text textStyle="cellBold">{`${user.firstName} ${user.lastName}`}</Text>
                      </HStack>
                    </Td>
                    <Td color="gray.600">
                      <Text textStyle="cellBody">{user.email}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Text
                        textStyle="cellBold"
                        color={getAbsenceColor(
                          user.absences?.length || 0,
                          absenceCap
                        )}
                      >
                        {user.absences?.length || 0}
                      </Text>
                    </Td>
                    <Td>
                      <EditableRoleCell
                        key={`role-cell-${user.id}`}
                        role={user.role}
                        onRoleChange={(newRole) =>
                          updateUserRole(user.id, newRole as Role)
                        }
                      />
                    </Td>
                    <Td>
                      <Wrap spacing={2}>
                        {user.mailingLists?.map((mailingList, index) => (
                          <WrapItem key={index}>
                            <Tag
                              height="28px"
                              variant="subtle"
                              key={index}
                              bg={mailingList.subject.colorGroup.colorCodes[3]}
                            >
                              <TagLabel>
                                <Text
                                  color={
                                    mailingList.subject.colorGroup.colorCodes[0]
                                  }
                                  textStyle="label"
                                >
                                  {mailingList.subject.name}
                                </Text>
                              </TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Td>
                  </Tr>
                ))
              : null}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default UserManagementTable;
