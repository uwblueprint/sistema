import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Role, UserAPI } from '@utils/types';
import React, { useState } from 'react';
import {
  FiClock,
  FiEdit2,
  FiLock,
  FiMail,
  FiSearch,
  FiTag,
  FiUser,
} from 'react-icons/fi';
import { IoFilterOutline } from 'react-icons/io5';

type EditableRoleCellProps = {
  role: string;
  onRoleChange: (newRole: string) => void;
};

const EditableRoleCell = ({ role, onRoleChange }: EditableRoleCellProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState(role);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNewRole(event.target.value);
  };

  const handleConfirmClick = () => {
    onRoleChange(newRole);
    setIsEditing(false);
  };

  return isEditing ? (
    <Box display="inline-flex" alignItems="center">
      <Select value={newRole} onChange={handleRoleChange} mr={2}>
        <option value="TEACHER">Teacher</option>
        <option value="ADMIN">Admin</option>
      </Select>
      {newRole !== role && (
        <Button variant="outline" onClick={handleConfirmClick}>
          <CheckIcon />
        </Button>
      )}
      <Button variant="outline" onClick={() => setIsEditing(false)}>
        <CloseIcon />
      </Button>
    </Box>
  ) : (
    <Box
      display="inline-flex"
      alignItems="center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      bg={isHovered ? 'gray.100' : 'transparent'}
      p={2}
      borderRadius="md"
    >
      <Text variant="cellBody">{role === 'TEACHER' ? 'Teacher' : 'Admin'}</Text>{' '}
      <Icon
        as={FiEdit2}
        onClick={handleEditClick}
        cursor="pointer"
        ml={2}
        marginLeft={3}
        visibility={isHovered ? 'visible' : 'hidden'}
      />
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

  const getAbsenceColor = (absences: number, cap: number) => {
    const ratio = absences / cap;
    if (ratio <= 0.5) return 'positiveGreen.200';
    if (ratio <= 0.8) return 'warningOrange.200';
    return 'errorRed.200';
  };

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

  const sortedUsers = [...users].sort((a, b) => {
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
  }: {
    field: SortField;
    label: string;
    icon: any;
  }) => {
    const isActive = sortField === field;
    const color = isActive ? 'primaryBlue.300' : 'text.subtitle';

    return (
      <Th onClick={() => handleSort(field)} cursor="pointer">
        <HStack spacing={2}>
          <Icon as={icon} boxSize={4} color={color} />
          <Heading size="h4" color={color} textTransform="none">
            {label}
          </Heading>
          <SortIcon field={field} />
        </HStack>
      </Th>
    );
  };

  return (
    <Box
      shadow="sm"
      borderRadius="lg"
      bg="white"
      w="full"
      border="1px solid"
      borderColor="neutralGray.300"
    >
      <HStack justify="space-between" mx={5} my={3}>
        <Heading fontSize={'22px'} lineHeight="33px" fontWeight={700}>
          User Management
        </Heading>
        <HStack spacing={4}>
          <InputGroup maxW="xs" margin={0}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="neutralGray.600" boxSize={6} />
            </InputLeftElement>
            <Input
              paddingRight={0}
              color="black"
              onFocus={(e) => {
                e.target.style.width = '270px';
                e.target.style.flex = '1';
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  e.target.style.width = '0px';
                  e.target.style.flex = '0';
                }
              }}
              transition="width 0.3s ease"
              width="0px"
              margin={0}
            />
          </InputGroup>

          <Button
            variant="outline"
            leftIcon={<Icon as={IoFilterOutline} />}
            width="100px"
            flexGrow={0}
            flexShrink={0}
          >
            Filter
          </Button>
        </HStack>
      </HStack>
      <Divider />
      <Box overflowX="auto" maxHeight="40vh">
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
              <SortableHeader field="absences" label="Abs." icon={FiClock} />
              <SortableHeader field="role" label="Role" icon={FiLock} />
              <Th>
                <HStack spacing={2}>
                  <Icon as={FiTag} boxSize={4} color="text.subtitle" />
                  <Heading size="h4" color="text.subtitle" textTransform="none">
                    Email Subscriptions
                  </Heading>
                </HStack>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {sortedUsers.map((user, index) => (
              <Tr
                key={index}
                sx={{
                  ':last-child td': { borderBottom: 'none' },
                  // ':first-child td': { borderTop: 'none' },
                }}
              >
                <Td>
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={`${user.firstName} ${user.lastName}`}
                    />
                    <Text variant="cellBold">{`${user.firstName} ${user.lastName}`}</Text>
                  </HStack>
                </Td>
                <Td color="gray.600">
                  <Text variant="cellBody">{user.email}</Text>
                </Td>
                <Td>
                  <Text
                    variant="cellBold"
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
                          size="md"
                          variant="subtle"
                          key={index}
                          color={mailingList.subject.colorGroup.colorCodes[0]}
                          bg={mailingList.subject.colorGroup.colorCodes[3]}
                        >
                          <TagLabel
                            fontWeight="600"
                            fontSize="12px"
                            lineHeight="18px"
                          >
                            {mailingList.subject.name}
                          </TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default UserManagementTable;
