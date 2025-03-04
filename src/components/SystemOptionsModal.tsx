import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Circle,
  useToast,
  Heading,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  IoEllipsisHorizontal,
  IoAdd,
  IoTrashOutline,
  IoArchiveOutline,
  IoCreateOutline,
} from 'react-icons/io5';
import ConfirmationDialog from './ConfirmationDialog';
import { Subject, SubjectAPI, Location } from '@utils/types';

interface SystemOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  absenceCap: number;
}

type ChangeType = 'delete' | 'archive' | 'unarchive' | 'update' | 'add';

interface Change {
  type: ChangeType;
  entity: 'subject' | 'location' | 'setting';
  id?: number;
  data?: any;
  displayText: string;
}

// Need to extend these types to include archived property
interface SubjectAPIWithArchived extends SubjectAPI {
  archived?: boolean;
}

interface LocationWithArchived extends Location {
  archived?: boolean;
}

const SystemOptionsModal: React.FC<SystemOptionsModalProps> = ({
  isOpen,
  onClose,
  absenceCap,
}) => {
  const [subjects, setSubjects] = useState<SubjectAPIWithArchived[]>([]);
  const [locations, setLocations] = useState<LocationWithArchived[]>([]);
  const [allowedAbsences, setAllowedAbsences] = useState<number>(absenceCap);
  const [pendingChanges, setPendingChanges] = useState<Change[]>([]);
  const [newSubject, setNewSubject] = useState({
    name: '',
    abbreviation: '',
    colorGroup: 'Strings',
  });
  const [newLocation, setNewLocation] = useState({
    name: '',
    abbreviation: '',
  });
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [selectedColorGroup, setSelectedColorGroup] = useState<string>('');
  const confirmationDialog = useDisclosure();
  const toast = useToast();

  // Color groups based on the screenshots
  const colorGroups = [
    { name: 'Strings', colors: ['#f44336', '#ff9800', '#ffeb3b'] },
    { name: 'Choir', colors: ['#4caf50', '#8bc34a', '#cddc39'] },
    { name: 'MMM', colors: ['#2196f3', '#03a9f4', '#00bcd4'] },
    { name: 'Percussion', colors: ['#9c27b0', '#673ab7', '#3f51b5'] },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      fetchLocations();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load locations',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddChange = (change: Change) => {
    // Remove any existing changes for the same entity and ID
    const filteredChanges = pendingChanges.filter(
      (c) => !(c.entity === change.entity && c.id === change.id)
    );

    setPendingChanges([...filteredChanges, change]);
  };

  const handleArchiveSubject = (subject: SubjectAPIWithArchived) => {
    handleAddChange({
      type: subject.archived ? 'unarchive' : 'archive',
      entity: 'subject',
      id: subject.id,
      data: { archived: !subject.archived },
      displayText: `${subject.archived ? 'Unarchived' : 'Archived'} Subject "${subject.name}"`,
    });
  };

  const handleDeleteSubject = (subject: SubjectAPIWithArchived) => {
    handleAddChange({
      type: 'delete',
      entity: 'subject',
      id: subject.id,
      displayText: `Deleted Subject "${subject.name}"`,
    });
  };

  const handleArchiveLocation = (location: LocationWithArchived) => {
    handleAddChange({
      type: location.archived ? 'unarchive' : 'archive',
      entity: 'location',
      id: location.id,
      data: { archived: !location.archived },
      displayText: `${location.archived ? 'Unarchived' : 'Archived'} Location "${location.name}"`,
    });
  };

  const handleDeleteLocation = (location: LocationWithArchived) => {
    handleAddChange({
      type: 'delete',
      entity: 'location',
      id: location.id,
      displayText: `Deleted Location "${location.name}"`,
    });
  };

  const handleAbsenceCapChange = (value: number) => {
    setAllowedAbsences(value);
    if (value !== absenceCap) {
      handleAddChange({
        type: 'update',
        entity: 'setting',
        data: { absenceCap: value },
        displayText: `Updated Allowed Absences "${absenceCap}" → "${value}"`,
      });
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.abbreviation) return;

    // Find colorGroupId based on name
    const colorGroup = colorGroups.find(
      (cg) => cg.name === newSubject.colorGroup
    );
    if (!colorGroup) return;

    handleAddChange({
      type: 'add',
      entity: 'subject',
      data: {
        name: newSubject.name,
        abbreviation: newSubject.abbreviation,
        colorGroupId: colorGroups.indexOf(colorGroup) + 1, // Assuming IDs start at 1
      },
      displayText: `Added Subject "${newSubject.name}"`,
    });

    setIsAddingSubject(false);
    setNewSubject({ name: '', abbreviation: '', colorGroup: 'Strings' });
  };

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.abbreviation) return;

    handleAddChange({
      type: 'add',
      entity: 'location',
      data: {
        name: newLocation.name,
        abbreviation: newLocation.abbreviation,
      },
      displayText: `Added Location "${newLocation.name}"`,
    });

    setIsAddingLocation(false);
    setNewLocation({ name: '', abbreviation: '' });
  };

  const applyChanges = async () => {
    const results = [];
    let hasErrors = false;

    for (const change of pendingChanges) {
      try {
        if (change.entity === 'subject') {
          if (change.type === 'delete') {
            await fetch(`/api/subjects/${change.id}`, { method: 'DELETE' });
          } else if (
            change.type === 'archive' ||
            change.type === 'unarchive' ||
            change.type === 'update'
          ) {
            await fetch(`/api/subjects/${change.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(change.data),
            });
          } else if (change.type === 'add') {
            await fetch('/api/subjects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(change.data),
            });
          }
        } else if (change.entity === 'location') {
          if (change.type === 'delete') {
            await fetch(`/api/locations/${change.id}`, { method: 'DELETE' });
          } else if (
            change.type === 'archive' ||
            change.type === 'unarchive' ||
            change.type === 'update'
          ) {
            await fetch(`/api/locations/${change.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(change.data),
            });
          } else if (change.type === 'add') {
            await fetch('/api/locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(change.data),
            });
          }
        } else if (change.entity === 'setting') {
          await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
          });
        }

        results.push({ success: true, message: change.displayText });
      } catch (error) {
        console.error(`Error applying change: ${change.displayText}`, error);
        results.push({
          success: false,
          message: `Error: ${change.displayText}`,
        });
        hasErrors = true;
      }
    }

    if (hasErrors) {
      toast({
        title: 'Error',
        description: 'Some changes could not be applied. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Success',
        description: 'All changes applied successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }

    // Refresh the data
    fetchSubjects();
    fetchLocations();

    // Clear pending changes
    setPendingChanges([]);

    // Close confirmation dialog
    confirmationDialog.onClose();
  };

  const handleSave = () => {
    if (pendingChanges.length > 0) {
      confirmationDialog.onOpen();
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Box>
                <Text>System Options</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalBody maxHeight="70vh" overflowY="auto">
            <VStack align="stretch" spacing={6}>
              {/* Subjects Section */}
              <Box>
                <Heading size="sm" mb={3} color="gray.600">
                  Subjects & Defaults
                </Heading>
                <VStack align="stretch" spacing={3}>
                  {subjects.map((subject) => (
                    <HStack
                      key={subject.id}
                      spacing={4}
                      justify="space-between"
                    >
                      <HStack>
                        <Circle
                          size="20px"
                          bg={subject.colorGroup.colorCodes[0]}
                        />
                        <Text>
                          {subject.name} & {subject.abbreviation}
                        </Text>
                      </HStack>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<IoEllipsisHorizontal />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<IoCreateOutline />}
                            onClick={() => {
                              /* Edit functionality */
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<IoArchiveOutline />}
                            onClick={() => handleArchiveSubject(subject)}
                          >
                            {subject.archived ? 'Unarchive' : 'Archive'}
                          </MenuItem>
                          <MenuItem
                            icon={<IoTrashOutline />}
                            onClick={() => handleDeleteSubject(subject)}
                            color="red.500"
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  ))}

                  {isAddingSubject ? (
                    <VStack
                      align="stretch"
                      spacing={3}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input
                          value={newSubject.name}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              name: e.target.value,
                            })
                          }
                          placeholder="Subject name"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Abbreviation</FormLabel>
                        <Input
                          value={newSubject.abbreviation}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              abbreviation: e.target.value,
                            })
                          }
                          placeholder="Abbreviation"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Color Group</FormLabel>
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<IoEllipsisHorizontal />}
                          >
                            {newSubject.colorGroup}
                          </MenuButton>
                          <MenuList>
                            {colorGroups.map((group) => (
                              <MenuItem
                                key={group.name}
                                onClick={() =>
                                  setNewSubject({
                                    ...newSubject,
                                    colorGroup: group.name,
                                  })
                                }
                              >
                                <HStack>
                                  <Circle size="20px" bg={group.colors[0]} />
                                  <Text>{group.name}</Text>
                                </HStack>
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                      </FormControl>
                      <HStack justify="flex-end">
                        <Button
                          size="sm"
                          onClick={() => setIsAddingSubject(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={handleAddSubject}
                        >
                          Add
                        </Button>
                      </HStack>
                    </VStack>
                  ) : (
                    <Button
                      leftIcon={<IoAdd />}
                      variant="ghost"
                      justifyContent="flex-start"
                      onClick={() => setIsAddingSubject(true)}
                    >
                      Add
                    </Button>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* Settings Section */}
              <Box>
                <Heading size="sm" mb={3} color="gray.600">
                  Strings
                </Heading>
                <VStack align="stretch" spacing={3}>
                  <FormControl>
                    <FormLabel>Allowed Absences</FormLabel>
                    <NumberInput
                      value={allowedAbsences}
                      onChange={(_, value) => handleAbsenceCapChange(value)}
                      min={1}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </VStack>
              </Box>

              <Divider />

              {/* Locations Section */}
              <Box>
                <Heading size="sm" mb={3} color="gray.600">
                  TBC
                </Heading>
                <VStack align="stretch" spacing={3}>
                  {locations.map((location) => (
                    <HStack
                      key={location.id}
                      spacing={4}
                      justify="space-between"
                    >
                      <Text>{location.name}</Text>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<IoEllipsisHorizontal />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<IoCreateOutline />}
                            onClick={() => {
                              /* Edit functionality */
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<IoArchiveOutline />}
                            onClick={() => handleArchiveLocation(location)}
                          >
                            {location.archived ? 'Unarchive' : 'Archive'}
                          </MenuItem>
                          <MenuItem
                            icon={<IoTrashOutline />}
                            onClick={() => handleDeleteLocation(location)}
                            color="red.500"
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  ))}

                  {isAddingLocation ? (
                    <VStack
                      align="stretch"
                      spacing={3}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input
                          value={newLocation.name}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              name: e.target.value,
                            })
                          }
                          placeholder="Location name"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Abbreviation</FormLabel>
                        <Input
                          value={newLocation.abbreviation}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              abbreviation: e.target.value,
                            })
                          }
                          placeholder="Abbreviation"
                        />
                      </FormControl>
                      <HStack justify="flex-end">
                        <Button
                          size="sm"
                          onClick={() => setIsAddingLocation(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={handleAddLocation}
                        >
                          Add
                        </Button>
                      </HStack>
                    </VStack>
                  ) : (
                    <Button
                      leftIcon={<IoAdd />}
                      variant="ghost"
                      justifyContent="flex-start"
                      onClick={() => setIsAddingLocation(true)}
                    >
                      Add
                    </Button>
                  )}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={confirmationDialog.onClose}
        onConfirm={applyChanges}
        title="You are making the following changes"
        changes={pendingChanges.map((change) => change.displayText)}
      />
    </>
  );
};

export default SystemOptionsModal;
