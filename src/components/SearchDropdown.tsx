import {
  Avatar,
  Box,
  CloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Option = { name: string; id: number; profilePicture: string };

interface SearchDropdownProps {
  label: string;
  type: 'user';
  excludedId?: string;
  onChange: (value: Option | null) => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  type,
  excludedId,
  onChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/formDropdown');
      if (res.ok) {
        const data = await res.json();

        if (type === 'user') {
          const sortedOptions = data.userOptions.sort((a: Option, b: Option) =>
            a.name.localeCompare(b.name)
          );
          setOptions(sortedOptions);
          setFilteredOptions(sortedOptions);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${type} options:`, error);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (value.trim() === '') {
        setFilteredOptions([]);
        onClose();
      } else {
        let filtered = options.filter((option) =>
          option.name.toLowerCase().includes(value.toLowerCase())
        );
        if (excludedId) {
          filtered = filtered.filter(
            (option) => String(option.id) !== excludedId
          );
        }
        setFilteredOptions(filtered);
        onOpen();
      }
    },
    [options, excludedId, onOpen, onClose]
  );

  const handleOptionSelect = useCallback(
    (option: Option) => {
      setSearchQuery(option.name);
      setSelectedOption(option);
      setIsSelected(true);
      onChange(option);
      setTimeout(() => inputRef.current?.focus(), 0);
      onClose();
    },
    [onChange, onClose]
  );

  const handleClearSelection = useCallback(() => {
    setSearchQuery('');
    setSelectedOption(null);
    setIsSelected(false);
    onChange(null);
    onClose();
  }, [onChange, onClose]);

  return (
    <Box>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        placement="bottom-start"
        autoFocus={false}
      >
        {isSelected ? (
          <InputGroup>
            <InputLeftElement>
              <Avatar
                name={selectedOption?.name || searchQuery}
                src={selectedOption?.profilePicture}
                size="sm"
                p="4px"
              />
            </InputLeftElement>
            <Input
              ref={inputRef}
              value={searchQuery}
              isReadOnly
              cursor="default"
              fontWeight="600"
            />
            <InputRightElement>
              <CloseButton
                onClick={handleClearSelection}
                color="neutralGray.600"
              />
            </InputRightElement>
          </InputGroup>
        ) : (
          <PopoverTrigger>
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={() =>
                handleSearchChange({
                  target: { value: searchQuery },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              placeholder={`Search for ${label}`}
            />
          </PopoverTrigger>
        )}

        <PopoverContent
          boxShadow="sm"
          width="300px"
          mt="-5px"
          borderRadius="md"
        >
          <VStack align="stretch" spacing={0}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <Box
                  key={option.id}
                  sx={{
                    borderRadius:
                      index === 0
                        ? 'md md 0 0'
                        : index === filteredOptions.length - 1
                          ? '0 0 md md'
                          : '0',
                    bg: 'transparent',
                    _hover: {
                      bg: 'neutralGray.100',
                    },
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  cursor="pointer"
                  onClick={() => handleOptionSelect(option)}
                >
                  <Avatar
                    name={option.name}
                    src={option.profilePicture}
                    size="sm"
                    m="4px"
                    p="4px"
                  />
                  <Text textStyle="subtitle">{option.name}</Text>
                </Box>
              ))
            ) : (
              <Box p="6px" m="6px">
                <Text textStyle="subtitle">No matches found</Text>
              </Box>
            )}
          </VStack>
        </PopoverContent>
      </Popover>
    </Box>
  );
};
