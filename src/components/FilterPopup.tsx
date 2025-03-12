import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  NumberInput,
  NumberInputField,
  Spacer,
  Tag,
  TagLabel,
  Text,
  VStack,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react';
import { Role } from '@utils/types';
import React, { useMemo, useRef, useState } from 'react';
import { BiRevision } from 'react-icons/bi';
import { IoFilterOutline } from 'react-icons/io5';
import OperatorMenu from './OperatorMenu';
// Define comparison operators for numeric filters
export type ComparisonOperator = 'greater_than' | 'less_than' | 'equal_to';

export type FilterOptions = {
  role?: Role | null;
  absencesOperator?: ComparisonOperator;
  absencesValue?: number | null;
  tags?: string[] | null;
};

interface FilterPopupProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  availableTags: string[];
  tagColors?: Record<string, string[]>; // Make tagColors optional
}

export const FilterPopup: React.FC<FilterPopupProps> = ({
  filters,
  setFilters,
  availableTags,
  tagColors = {}, // Provide default empty object
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const popoverRef = useRef<HTMLDivElement>(null);
  const operatorMenuRef = useRef<HTMLDivElement>(null);
  const [operatorMenuOpen, setOperatorMenuOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.role) count++;
    if (filters.absencesValue !== null) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    return count;
  }, [filters]);

  // Handle clicks outside the popover to close it
  useOutsideClick({
    ref: popoverRef,
    handler: () => isOpen && onClose(),
  });

  // Handle clicks outside the operator menu to close it
  useOutsideClick({
    ref: operatorMenuRef,
    handler: (e) => {
      if (
        operatorMenuOpen &&
        !operatorMenuRef.current?.contains(e.target as Node)
      ) {
        setOperatorMenuOpen(false);
      }
    },
  });

  const handleRoleSelect = (role: Role | null) => {
    // Toggle selection: if the clicked role is already selected, deselect it
    if (filters.role === role) {
      setFilters({ ...filters, role: null });
    } else {
      setFilters({ ...filters, role });
    }
  };

  const handleAbsencesOperatorChange = (operator: ComparisonOperator) => {
    setFilters({ ...filters, absencesOperator: operator });
    setOperatorMenuOpen(false);
  };

  const handleAbsencesValueChange = (value: string) => {
    if (value === '' || value === '-') {
      setFilters({ ...filters, absencesValue: null });
      return;
    }

    const numValue = parseInt(value, 10);

    if (!isNaN(numValue)) {
      setFilters({ ...filters, absencesValue: numValue });
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags?.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...(filters.tags || []), tag];

    setFilters({ ...filters, tags: newTags });
  };

  const handleReset = () => {
    setFilters({
      role: null,
      absencesOperator: 'greater_than',
      absencesValue: null,
      tags: [],
    });
  };

  const getOperatorLabel = (operator: ComparisonOperator): string => {
    switch (operator) {
      case 'greater_than':
        return 'Greater than';
      case 'less_than':
        return 'Less than';
      case 'equal_to':
        return 'Equal to';
      default:
        return 'Greater than';
    }
  };

  return (
    <Box position="relative" ref={popoverRef}>
      <Button
        variant="outline"
        leftIcon={<Icon as={IoFilterOutline} color={'neutralGray.600'} />}
        flexGrow={0}
        flexShrink={0}
        onClick={onToggle}
        position="relative"
        justifyContent="space-between"
        px={3}
        transition="all 0.3s ease-in-out"
      >
        <HStack
          spacing={activeFilterCount > 0 ? 2 : 1}
          width="full"
          justifyContent="space-between"
          transition="all 0.3s ease-in-out"
        >
          <Text textStyle="h3">Filter</Text>
          <Box
            width={activeFilterCount > 0 ? '20px' : '0px'}
            height="20px"
            bg={activeFilterCount > 0 ? 'primaryBlue.50' : 'transparent'}
            color="primaryBlue.300"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            ml={activeFilterCount > 0 ? 'auto' : '0px'}
            opacity={activeFilterCount > 0 ? 1 : 0}
            transform={activeFilterCount > 0 ? 'scale(1)' : 'scale(0)'}
            transition="all 0.3s ease-in-out"
          >
            {activeFilterCount > 0 && (
              <Text textStyle="subtitle" color="primaryBlue.300">
                {activeFilterCount}
              </Text>
            )}
          </Box>
        </HStack>
      </Button>

      <Box
        position="absolute"
        top="40px"
        right="0"
        zIndex={10}
        width="350px"
        bg="white"
        borderRadius="md"
        boxShadow="md"
        border="1px solid"
        borderColor="neutralGray.300"
        p={5}
        opacity={isOpen ? 1 : 0}
        visibility={isOpen ? 'visible' : 'hidden'}
        transform={isOpen ? 'translateY(0)' : 'translateY(-10px)'}
        transition="all 0.3s ease-in-out"
      >
        <Flex justifyContent="space-between" alignItems="center" mb={5}>
          <Text textStyle="h3">Filter Options</Text>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<Icon as={BiRevision} transform="scaleX(-1)" />}
          >
            <Text textStyle="label">Reset</Text>
          </Button>
        </Flex>

        {/* Filter Options */}
        <VStack align="stretch" spacing={4}>
          {/* Role Filter */}
          <Flex justify="space-between" align="center" gap={2}>
            <Text textStyle="h4">Role</Text>
            <Spacer />
            <Button
              size="sm"
              variant={filters.role === Role.TEACHER ? 'solid' : 'outline'}
              colorScheme={filters.role === Role.TEACHER ? 'blue' : 'gray'}
              bgColor={
                filters.role === Role.TEACHER ? 'primaryBlue.300' : 'white'
              }
              color={filters.role === Role.TEACHER ? 'white' : 'text.body'}
              borderColor={
                filters.role === Role.TEACHER
                  ? 'primaryBlue.300'
                  : 'neutralGray.300'
              }
              borderWidth="1px"
              onClick={() => handleRoleSelect(Role.TEACHER)}
              width="auto"
              paddingX={2.5}
              paddingY={1.5}
              transition="all 0.3s ease-in-out"
            >
              <Text
                fontSize="12px"
                textStyle="label"
                color={filters.role === Role.TEACHER ? 'white' : 'text.body'}
              >
                Teacher
              </Text>
            </Button>
            <Button
              size="sm"
              variant={filters.role === Role.ADMIN ? 'solid' : 'outline'}
              colorScheme={filters.role === Role.ADMIN ? 'blue' : 'gray'}
              bgColor={
                filters.role === Role.ADMIN ? 'primaryBlue.300' : 'white'
              }
              color={filters.role === Role.ADMIN ? 'white' : 'text.body'}
              borderColor={
                filters.role === Role.ADMIN
                  ? 'primaryBlue.300'
                  : 'neutralGray.300'
              }
              borderWidth="1px"
              onClick={() => handleRoleSelect(Role.ADMIN)}
              width="auto"
              paddingX={2.5}
              paddingY={1.5}
              transition="all 0.3s ease-in-out"
            >
              <Text
                fontSize="12px"
                textStyle="label"
                color={filters.role === Role.ADMIN ? 'white' : 'text.body'}
              >
                Admin
              </Text>
            </Button>
          </Flex>

          {/* Absences Filter */}
          <Flex justify="space-between" align="center" gap={2}>
            <Text textStyle="h4">Absences</Text>
            <Spacer />
            <OperatorMenu
              selectedOperator={filters.absencesOperator || 'greater_than'}
              onOperatorChange={handleAbsencesOperatorChange}
              getOperatorLabel={getOperatorLabel}
            />

            <NumberInput
              width="53px"
              backgroundColor="neutralGray.100"
              borderRadius="5px"
              value={
                filters.absencesValue === null ? '' : filters.absencesValue
              }
              onChange={handleAbsencesValueChange}
            >
              <NumberInputField
                placeholder="e.g. 5"
                fontSize="12px"
                fontWeight="500"
                height="32px"
                paddingX={2.5}
                paddingY={1.5}
              />
            </NumberInput>
          </Flex>

          {/* Email Tags Filter */}
          <Box>
            <Text textStyle="h4">Email tags</Text>
            <Flex flexWrap="wrap" gap={1.5} mt={2}>
              {availableTags.map((tag) => {
                const isSelected = filters.tags?.includes(tag);
                const colors = tagColors[tag] || [
                  'primaryBlue.300',
                  'primaryBlue.50',
                ];

                return (
                  <Tag
                    key={tag}
                    height="28px"
                    variant="subtle"
                    cursor="pointer"
                    onClick={() => handleTagToggle(tag)}
                    bg={isSelected ? colors[3] : 'white'}
                    border="1px solid"
                    borderColor={isSelected ? colors[1] : 'neutralGray.300'}
                    borderRadius="6px"
                    transition="all 0.3s ease"
                    mb={0.5}
                  >
                    <TagLabel>
                      <Text textStyle="label" color="text.body">
                        {tag}
                      </Text>
                    </TagLabel>
                  </Tag>
                );
              })}
            </Flex>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default FilterPopup;
