import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
  Box,
  Text,
  Input,
  useDisclosure,
} from '@chakra-ui/react';

export type Option = { name: string; id: number };

interface SearchDropdownProps {
  label: string;
  type: 'user';
  onChange: (value: Option | null) => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  type,
  onChange,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === '') {
      setFilteredOptions([]);
      onClose();
    } else {
      const filtered = options.filter((option) =>
        option.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
      onOpen();
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/formDropdown');
      if (res.ok) {
        const data = await res.json();

        if (type === 'user') {
          setOptions(data.userOptions);
          setFilteredOptions(data.userOptions);
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
    if (selectedOption && selectedOption.id === option.id) {
      setSelectedOption(null);
      setSearchQuery('');
      onChange(null);
    } else {
      setSelectedOption(option);
      setSearchQuery(option.name);
      onChange(option);
      console.log('Selected Option:', option);
    }
    inputRef.current?.focus();
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        placement="bottom-start"
        autoFocus={false}
      >
        <PopoverTrigger>
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={`Search for ${label}`}
            onClick={() => searchQuery.trim() && onOpen()}
          />
        </PopoverTrigger>
        <PopoverContent
          ref={popoverRef}
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          _focus={{ boxShadow: 'sm', outline: 'none' }}
          width={inputRef.current?.offsetWidth}
        >
          <VStack align="stretch" spacing={0}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Box
                  key={option.id}
                  px={4}
                  py={2}
                  _hover={{ bg: 'gray.100' }}
                  cursor="pointer"
                  onClick={() => handleOptionSelect(option)}
                >
                  <Text>{option.name}</Text>
                </Box>
              ))
            ) : (
              <Box px={4} py={2}>
                <Text color="gray.500">No matches found</Text>
              </Box>
            )}
          </VStack>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import {
//   Menu,
//   MenuList,
//   MenuItem,
//   Text,
//   Input,
//   useDisclosure,
// } from '@chakra-ui/react';

// export type Option = { name: string; id: number };

// interface SearchDropdownProps {
//   label: string;
//   type: 'user';
//   onChange: (value: Option | null) => void;
// }

// export const SearchDropdown: React.FC<SearchDropdownProps> = ({
//   label,
//   type,
//   onChange,
// }) => {
//   const [options, setOptions] = useState<Option[]>([]);
//   const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
//   const [selectedOption, setSelectedOption] = useState<Option | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>('');

//   const { isOpen, onOpen, onClose } = useDisclosure();

//   const menuRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchQuery(value);
//     if (value.trim() === '') {
//       setFilteredOptions([]);
//       onClose();
//     } else {
//       const filtered = options.filter((option) =>
//         option.name.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredOptions(filtered);
//       onOpen();
//     }
//   };

//   const fetchData = useCallback(async () => {
//     try {
//       const res = await fetch('/api/formDropdown');
//       if (res.ok) {
//         const data = await res.json();

//         if (type === 'user') {
//           setOptions(data.userOptions);
//           setFilteredOptions(data.userOptions);
//         }
//       }
//     } catch (error) {
//       console.error(`Failed to fetch ${type} options:`, error);
//     }
//   }, [type]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleOptionSelect = (option: Option) => {
//     if (selectedOption && selectedOption.id === option.id) {
//       setSelectedOption(null); // Unselect if clicking the same option
//       onChange(null);
//     } else {
//       setSelectedOption(option);
//       onChange(option);
//     }

//     onClose(); // Close dropdown when an option is selected
//   };

//   // Close dropdown if clicking outside menu or input
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         menuRef.current &&
//         !menuRef.current.contains(event.target as Node) &&
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         onClose();
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [onClose]);

//   return (
//     <Menu isOpen={isOpen} onClose={onClose} placement="bottom-start">
//       <Input
//         ref={inputRef}
//         value={searchQuery}
//         onChange={handleSearchChange}
//         placeholder={`Search for ${label}`}
//       />
//       <MenuList rootProps={{ width: '100%' }}>
//         {filteredOptions.length > 0 ? (
//           filteredOptions.map((option) => (
//             <MenuItem
//               key={option.id}
//               onClick={() => handleOptionSelect(option)}
//             >
//               <Text>{option.name}</Text>
//             </MenuItem>
//           ))
//         ) : (
//           <MenuItem disabled>No matching teachers!</MenuItem>
//         )}
//       </MenuList>
//     </Menu>
//   );
// };
