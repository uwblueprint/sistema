import { CheckIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

export type Option = { name: string; id: number };

interface InputDropdownProps {
  label: string;
  type: 'location' | 'subject';
  onChange: (value: Option | null) => void;
}

export const InputDropdown: React.FC<InputDropdownProps> = ({
  label,
  type,
  onChange,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/formDropdown');
      if (res.ok) {
        const data = await res.json();

        if (type === 'location') {
          setOptions(data.locationOptions);
        } else if (type === 'subject') {
          setOptions(data.subjectOptions);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${type} options:`, error);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option);
    onChange(option);
  };

  return (
    <Menu offset={[0, 2]}>
      <InputGroup>
        <Input as={MenuButton} textAlign="left" pr="2.5rem">
          <Text fontSize="14px" color={selectedOption ? 'black' : 'gray.500'}>
            {selectedOption ? selectedOption.name : `Please select ${label}`}
          </Text>
        </Input>
        {/* Dropdown Arrow */}
        <InputRightElement pointerEvents="none">
          <ChevronDownIcon />
        </InputRightElement>
      </InputGroup>

      <MenuList rootProps={{ width: '100%' }} p={0}>
        {options.map((option) => (
          <MenuItem
            fontSize="14px"
            width="100%"
            key={option.id}
            onClick={() => handleOptionSelect(option)}
            sx={{ padding: '10px 16px' }}
          >
            <Box>
              <Text color="gray.500">{option.name}</Text>
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export interface DropdownItem {
  id: number;
  name: string;
  color: string;
}

export interface DropdownProps {
  title: string;
  items: DropdownItem[];
  selectedItems: number[];
  isOpen: boolean;
  toggleOpen: () => void;
  toggleItem: (id: number) => void;
}

const Dropdown = ({
  title,
  items,
  selectedItems,
  isOpen,
  toggleOpen,
  toggleItem,
}: DropdownProps) => {
  return (
    <Box width="100%">
      <Button
        onClick={toggleOpen}
        width="100%"
        variant="ghost"
        px={1}
        py={0}
        height="32px"
      >
        <Flex justify="space-between" align="center" width="100%">
          <Text fontWeight="semibold" fontSize="14px">
            {title}
          </Text>
          {isOpen ? <IoChevronUp size={24} /> : <IoChevronDown size={24} />}
        </Flex>
      </Button>
      <Box pl={1} mt={2}>
        <Collapse in={isOpen} animateOpacity>
          <Stack spacing={2} mt={0}>
            {items.map((item) => (
              <Flex
                key={item.name}
                align="center"
                cursor="pointer"
                onClick={() => toggleItem(item.id)}
              >
                <Box
                  width="20px"
                  height="20px"
                  mr={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="2px"
                  bg={selectedItems.includes(item.id) ? item.color : 'white'}
                  border={`2px solid ${item.color}`}
                >
                  {selectedItems.includes(item.id) && (
                    <Icon as={CheckIcon} color="white" w="14px" h="14px" />
                  )}
                </Box>
                <Text textStyle="subtitle" color="text.body">
                  {item.name}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Dropdown;
