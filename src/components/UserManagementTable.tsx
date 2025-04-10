import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';

import {
  Avatar,
  Box,
  Divider,
  Flex,
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
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react';

import { getAbsenceColor } from '@utils/getAbsenceColor';
import { FilterOptions, Role, UserAPI } from '@utils/types';
import useUserFiltering from '@hooks/useUserFiltering';
import React, { useEffect, useState } from 'react';
import {
  FiClock,
  FiLock,
  FiMail,
  FiSearch,
  FiTag,
  FiUser,
} from 'react-icons/fi';
import EditableRoleCell from './EditableRoleCell';
import FilterPopup, { NO_EMAIL_TAGS } from './FilterPopup';

type SortField = 'name' | 'email' | 'absences' | 'role';

type SortDirection = 'asc' | 'desc';

interface UserManagementTableProps {
  users: UserAPI[];
  updateUserRole: (userId: number, newRole: Role) => void;
  absenceCap: number;
  isLoading?: boolean;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  updateUserRole,
  absenceCap,
  isLoading = false,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterOptions>({
    role: null,
    absencesOperator: 'greater_than',
    absencesValue: null,
    disabledTags: [],
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

  // Sort the filtered users
  const { sortedUsers } = useUserFiltering(
    users,
    filters,
    searchTerm,
    sortField,
    sortDirection
  );

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
      minWidth="402px"
      border="1px solid"
      borderColor="neutralGray.300"
      height="100%"
    >
      <HStack justify="space-between" mx={5} my={3}>
        <Text textStyle="h2" fontSize="18px" fontWeight={700} lineHeight="33px">
          User Management
        </Text>
        <HStack spacing={4}>
          <InputGroup maxW="xs" margin={0}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="neutralGray.600" boxSize={6} />
            </InputLeftElement>
            <Input
              borderColor={'neutralGray.300'}
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
              isDisabled={isLoading}
            />
          </InputGroup>
          <FilterPopup
            filters={filters}
            setFilters={setFilters}
            availableTags={availableTags}
            tagColors={tagColors}
            isDisabled={isLoading}
          />
        </HStack>
      </HStack>
      <Divider borderColor="neutralGray.300" />
      <Box flex="1" overflowY="auto">
        <Table variant="simple">
          <Thead
            position="sticky"
            top={0}
            zIndex={1}
            bg="white"
            boxShadow="0 1px 1px rgba(227, 227, 227, 1)"
          >
            <Tr>
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
                    whiteSpace="nowrap"
                  >
                    Email Subscriptions
                  </Text>
                </HStack>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading
              ? null
              : sortedUsers.map((user, index) => (
                  <Tr
                    key={index}
                    sx={{
                      ':last-child td': { borderBottom: 'none' },
                    }}
                  >
                    <Td py="6px">
                      <HStack spacing={5}>
                        <Avatar
                          size="sm"
                          name={`${user.firstName} ${user.lastName}`}
                          src={user.profilePicture || undefined}
                          loading="eager"
                          ignoreFallback
                        />
                        <Text textStyle="cellBold">{`${user.firstName} ${user.lastName}`}</Text>
                      </HStack>
                    </Td>
                    <Td color="gray.600">
                      <Text textStyle="cellBody">{user.email}</Text>
                    </Td>
                    <Td textAlign="center" py="6px">
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
                    <Td py="6px">
                      <EditableRoleCell
                        key={`role-cell-${user.id}`}
                        role={user.role}
                        onRoleChange={(newRole) =>
                          updateUserRole(user.id, newRole as Role)
                        }
                      />
                    </Td>
                    <Td py="6px">
                      <Flex gap={2} wrap="nowrap">
                        {user.mailingLists?.map((mailingList, index) => (
                          <Tag
                            height="28px"
                            variant="subtle"
                            bg={mailingList.subject.colorGroup.colorCodes[3]}
                            key={index}
                          >
                            <TagLabel>
                              <Text
                                color={
                                  mailingList.subject.colorGroup.colorCodes[0]
                                }
                                textStyle="label"
                                whiteSpace="nowrap"
                                overflow="hidden"
                              >
                                {mailingList.subject.name}
                              </Text>
                            </TagLabel>
                          </Tag>
                        ))}
                      </Flex>
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
