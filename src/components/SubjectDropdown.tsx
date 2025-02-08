'use client';

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Box,
  Icon,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@chakra-ui/icons';
import * as React from 'react';

interface SubjectDropdownProps {
  setFilter: (subjects: string[]) => void;
}

const subjects = [
  { name: 'Strings', color: 'purple.500' },
  { name: 'Choir', color: 'orange.300' },
  { name: 'Music and Movement', color: 'green.400' },
  { name: 'Percussion', color: 'gray.600' },
  { name: 'Trumpet/Clarinet', color: 'red.400' },
];

export default function SubjectDropdown({ setFilter }: SubjectDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  // Initialize with all subjects selected by default
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>(
    subjects.map((subject) => subject.name)
  );

  React.useEffect(() => {
    setFilter(selectedSubjects);
  }, [setFilter, selectedSubjects]);

  const toggleSubject = (subject: string) => {
    let newSelection: string[];
    if (selectedSubjects.includes(subject)) {
      newSelection = selectedSubjects.filter((s) => s !== subject);
    } else {
      newSelection = [...selectedSubjects, subject];
    }
    setSelectedSubjects(newSelection);
    setFilter(newSelection);
  };

  return (
    <Box width="100%" p={0}>
      <Menu
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        matchWidth
        closeOnSelect={false}
      >
        <MenuButton
          as={Button}
          width="100%"
          variant="outline"
          border={0}
          p={0}
          _hover={{ bg: 'none' }}
          _focus={{ bg: 'none', boxShadow: 'none', outline: 'none' }}
          _active={{ bg: 'none' }}
        >
          <Flex justify="space-between" align="center" width="100%">
            <Text fontWeight="semibold" fontSize="16px">
              Subject
            </Text>
            {isOpen ? (
              <ChevronUpIcon boxSize="2.1em" p={0} m={0} />
            ) : (
              <ChevronDownIcon boxSize="2.1em" p={0} m={0} />
            )}
          </Flex>
        </MenuButton>
        <MenuList width="100%" border={0} boxShadow="none" m={0} p={0}>
          {subjects.map((subject) => (
            <MenuItem
              key={subject.name}
              onClick={() => toggleSubject(subject.name)}
              border={0}
              px={0}
              py={1}
            >
              <Flex alignItems="center" gap={2}>
                <Box position="relative" width="20px" height="20px">
                  <Box position="absolute" inset={0} bg={subject.color} />
                  {selectedSubjects.includes(subject.name) && (
                    <Icon
                      as={CheckIcon}
                      position="absolute"
                      inset={0}
                      color="white"
                      w="20px"
                      h="20px"
                    />
                  )}
                </Box>
                <Text fontSize="14px">{subject.name}</Text>
              </Flex>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
}
