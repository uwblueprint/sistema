import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  NumberInput,
  NumberInputField,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Tag,
  TagLabel,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { ComparisonOperator, FilterOptions, Role } from '@utils/types';
import { useMemo } from 'react';
import { BiRevision } from 'react-icons/bi';
import { IoFilterOutline } from 'react-icons/io5';
import OperatorMenu from './OperatorMenu';

interface FilterPopupProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  availableTags: string[];
  tagColors?: Record<string, string[]>;
  isDisabled?: boolean;
}

// Special tag identifier for users with no email tags
export const NO_EMAIL_TAGS = 'No Email Tags';

export const FilterPopup: React.FC<FilterPopupProps> = ({
  filters,
  setFilters,
  availableTags,
  tagColors = {},
  isDisabled = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.role) count++;
    if (filters.absencesValue !== null) count++;
    if (filters.disabledTags && filters.disabledTags.length > 0) {
      // Each disabled tag counts as one filter
      count += filters.disabledTags.length;
    }
    return count;
  }, [filters]);

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
    // Inverting the logic: now we track disabled tags instead of enabled ones
    const newDisabledTags = filters.disabledTags?.includes(tag)
      ? filters.disabledTags.filter((t) => t !== tag)
      : [...(filters.disabledTags || []), tag];

    setFilters({ ...filters, disabledTags: newDisabledTags });
  };

  const handleReset = () => {
    setFilters({
      role: null,
      absencesOperator: 'greater_than',
      absencesValue: null,
      disabledTags: [],
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
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-end"
    >
      <PopoverTrigger>
        <Button
          variant="outline"
          leftIcon={<Icon as={IoFilterOutline} color={'neutralGray.600'} />}
          flexGrow={0}
          flexShrink={0}
          position="relative"
          justifyContent="space-between"
          px={3}
          transition="all 0.3s ease-in-out"
          isDisabled={isDisabled}
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
      </PopoverTrigger>

      <PopoverContent
        width="350px"
        p={5}
        borderRadius="md"
        boxShadow="md"
        border="1px solid"
        borderColor="neutralGray.300"
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

        <VStack align="stretch" spacing={4}>
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
              borderWidth="1px"
              borderColor={
                filters.role === Role.TEACHER
                  ? 'primaryBlue.300'
                  : 'neutralGray.300'
              }
              _hover={{
                bg:
                  filters.role === Role.TEACHER
                    ? 'primaryBlue.500'
                    : 'neutralGray.100',
                borderColor:
                  filters.role === Role.TEACHER
                    ? 'primaryBlue.500'
                    : 'neutralGray.300',
              }}
              _active={{
                bg:
                  filters.role === Role.TEACHER
                    ? 'primaryBlue.600'
                    : 'neutralGray.300',
                borderColor:
                  filters.role === Role.TEACHER
                    ? 'primaryBlue.600'
                    : 'neutralGray.300',
              }}
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
              borderWidth="1px"
              borderColor={
                filters.role === Role.ADMIN
                  ? 'primaryBlue.300'
                  : 'neutralGray.300'
              }
              _hover={{
                bg:
                  filters.role === Role.ADMIN
                    ? 'primaryBlue.500'
                    : 'neutralGray.100',
                borderColor:
                  filters.role === Role.ADMIN
                    ? 'primaryBlue.500'
                    : 'neutralGray.300',
              }}
              _active={{
                bg:
                  filters.role === Role.ADMIN
                    ? 'primaryBlue.600'
                    : 'neutralGray.300',
                borderColor:
                  filters.role === Role.ADMIN
                    ? 'primaryBlue.600'
                    : 'neutralGray.300',
              }}
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
              borderRadius="5px"
              value={
                filters.absencesValue === null ? '' : filters.absencesValue
              }
              onChange={handleAbsencesValueChange}
            >
              <NumberInputField
                border="1px solid"
                borderColor="neutralGray.300"
                textStyle="label"
                placeholder="e.g. 5"
                fontSize="12px"
                fontWeight="500"
                height="32px"
                _placeholder={{ color: 'text.inactiveButtonText' }}
                paddingX={2.5}
                paddingY={1.5}
                _hover={{
                  borderColor: 'outline',
                }}
                _focus={{
                  borderColor: 'primaryBlue.300',
                  boxShadow: '0 0 0 1px primaryBlue.300',
                }}
                _active={{
                  borderColor: 'primaryBlue.300',
                  boxShadow: '0 0 0 1px primaryBlue.300',
                }}
              />
            </NumberInput>
          </Flex>

          <Box>
            <Text textStyle="h4">Email tags</Text>
            <Flex flexWrap="wrap" gap={1.5} mt={2}>
              {/* Special tag for users with no email subscriptions */}
              <Tag
                key={NO_EMAIL_TAGS}
                height="28px"
                variant="subtle"
                cursor="pointer"
                onClick={() => handleTagToggle(NO_EMAIL_TAGS)}
                bg={
                  !filters.disabledTags?.includes(NO_EMAIL_TAGS)
                    ? 'gray.100'
                    : 'white'
                }
                border="1px solid"
                borderColor={
                  !filters.disabledTags?.includes(NO_EMAIL_TAGS)
                    ? 'gray.300'
                    : 'neutralGray.300'
                }
                borderRadius="6px"
                transition="all 0.3s ease"
                mb={0.5}
              >
                <TagLabel>
                  <Text
                    textStyle="label"
                    color={
                      !filters.disabledTags?.includes(NO_EMAIL_TAGS)
                        ? 'gray.600'
                        : 'text.body'
                    }
                  >
                    {NO_EMAIL_TAGS}
                  </Text>
                </TagLabel>
              </Tag>

              {availableTags.map((tag) => {
                const isDisabled = filters.disabledTags?.includes(tag);
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
                    bg={!isDisabled ? colors[3] : 'white'}
                    border="1px solid"
                    borderColor={!isDisabled ? colors[1] : 'neutralGray.300'}
                    borderRadius="6px"
                    transition="all 0.3s ease"
                    mb={0.5}
                  >
                    <TagLabel>
                      <Text
                        textStyle="label"
                        color={!isDisabled ? colors[0] : 'text.body'}
                      >
                        {tag}
                      </Text>
                    </TagLabel>
                  </Tag>
                );
              })}
            </Flex>
          </Box>
        </VStack>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopup;
