import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Tag,
  Avatar,
  Heading,
  HStack,
  Wrap,
  WrapItem,
  Icon,
  Text,
  Select,
} from '@chakra-ui/react';
import {
  CheckIcon,
  CloseIcon,
  SearchIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from '@chakra-ui/icons';
import { IoFilterOutline } from 'react-icons/io5';
import { CiMail } from 'react-icons/ci';
import { GoClock, GoPerson, GoTag } from 'react-icons/go';
import { FiEdit2 } from 'react-icons/fi';
import { AbsenceAPI } from '@utils/types';

export type Role = 'TEACHER' | 'ADMIN';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: string;
  absences: AbsenceAPI[];
  subscriptions: Subscription[];
}

type Subscription =
  | 'Music & Movement'
  | 'Choir'
  | 'Strings'
  | 'Percussion'
  | 'Trumpets/Clarinets';

const subscriptionColors: Record<Subscription, string> = {
  'Music & Movement': 'cyan',
  Choir: 'orange',
  Strings: 'pink',
  Percussion: 'purple',
  'Trumpets/Clarinets': 'red',
};

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
      {role === 'TEACHER' ? 'Teacher' : 'Admin'}
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
  users: User[];
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
    if (ratio <= 0.5) return 'green.500';
    if (ratio <= 0.8) return 'orange.500';
    return 'red.500';
  };

  // set subscriptions to a temp thing for now
  users.forEach((user) => {
    user.subscriptions = ['Music & Movement', 'Choir', 'Strings'];
  });

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
    if (sortField !== field) {
      return <Icon as={TriangleDownIcon} boxSize={2} color="gray.400" />;
    }
    return (
      <Icon
        as={sortDirection === 'asc' ? TriangleUpIcon : TriangleDownIcon}
        boxSize={2}
        color="gray.600"
      />
    );
  };

  return (
    <Box shadow="sm" borderRadius="lg" bg="white" w="full">
      <Box p={6}>
        <HStack justify="space-between" mb={6}>
          <Heading size="lg">User Management</Heading>
          <HStack spacing={4}>
            <InputGroup maxW="xs" margin={0}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                _placeholder={{ color: 'gray.400' }}
                paddingRight={0}
                onFocus={(e) => {
                  e.target.placeholder = 'Search...';
                  e.target.style.width = '200px';
                  e.target.style.flex = '1';
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    e.target.placeholder = '';
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

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th onClick={() => handleSort('name')} cursor="pointer">
                  <HStack spacing={1}>
                    <Text>Name</Text>
                    <SortIcon field="name" />
                  </HStack>
                </Th>
                <Th onClick={() => handleSort('email')} cursor="pointer">
                  <HStack spacing={1}>
                    <Icon as={CiMail} boxSize={4} color="gray.500" />
                    <Text>Email</Text>
                    <SortIcon field="email" />
                  </HStack>
                </Th>
                <Th onClick={() => handleSort('absences')} cursor="pointer">
                  <HStack spacing={1}>
                    <Icon as={GoClock} boxSize={4} color="gray.500" />
                    <Text>Abs.</Text>
                    <SortIcon field="absences" />
                  </HStack>
                </Th>
                <Th onClick={() => handleSort('role')} cursor="pointer">
                  <HStack spacing={1}>
                    <Icon as={GoPerson} boxSize={3} color="gray.500" />
                    <Text>Role</Text>
                    <SortIcon field="role" />
                  </HStack>
                </Th>
                <Th>
                  <HStack spacing={1}>
                    <Icon as={GoTag} boxSize={4} color="gray.500" />
                    <Text>Email Subscriptions</Text>
                  </HStack>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedUsers.map((user, index) => (
                <Tr key={index}>
                  <Td>
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={`${user.firstName} ${user.lastName}`}
                      />
                      <Box>{`${user.firstName} ${user.lastName}`}</Box>
                    </HStack>
                  </Td>
                  <Td color="gray.600">{user.email}</Td>
                  <Td
                    color={getAbsenceColor(
                      user.absences?.length || 0,
                      absenceCap
                    )}
                  >
                    {user.absences?.length || 0}
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
                      {user.subscriptions.map((sub, subIndex) => (
                        <WrapItem key={subIndex}>
                          <Tag
                            size="md"
                            variant="subtle"
                            colorScheme={subscriptionColors[sub]}
                          >
                            {sub}
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
    </Box>
  );
};

export default UserManagementTable;
