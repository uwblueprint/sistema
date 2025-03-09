import React, { useMemo, useState } from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  Text,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';

export type Option = { name: string; id: number };

interface DropdownProps {
  label: string;
  type: 'location' | 'subject';
  onChange: (value: Option | null) => void;
  initialValue?: { id: number; name: string } | undefined;
  options: Option[];
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  type,
  onChange,
  initialValue,
  options,
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const memoizedInitialValue = useMemo(() => initialValue, [initialValue]);

  useMemo(() => {
    if (memoizedInitialValue) {
      const matchingOption = options.find(
        (option) => option.id === memoizedInitialValue.id
      );
      if (matchingOption) {
        setSelectedOption(matchingOption);
      }
    }
  }, [memoizedInitialValue, options]);

  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option);
    onChange(option);
  };

  return (
    <Menu offset={[0, 2]}>
      <InputGroup>
        <Input
          as={MenuButton}
          textAlign="left"
          pr="2.5rem"
          type="button"
          // onClick={(e) => e.preventDefault()}
        >
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
            onClick={(e) => {
              e.preventDefault();
              handleOptionSelect(option);
            }}
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
