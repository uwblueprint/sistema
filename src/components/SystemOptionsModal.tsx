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
  useTheme,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  IoEllipsisHorizontal,
  IoAdd,
  IoTrashOutline,
  IoArchiveOutline,
  IoCreateOutline,
  IoBookOutline,
  IoCheckmark,
  IoCloseOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import { FiType } from 'react-icons/fi';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Subject, SubjectAPI, Location } from '@utils/types';
import React from 'react';
import { LuInfo, LuArchive } from 'react-icons/lu';

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

interface ChangeResult {
  success: boolean;
  message: string;
}

const SystemOptionsModal: React.FC<SystemOptionsModalProps> = ({
  isOpen,
  onClose,
  absenceCap,
}) => {
  const COLOR_CODE_INDEX = 1;

  const [subjects, setSubjects] = useState<SubjectAPI[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [allowedAbsences, setAllowedAbsences] = useState<number>(absenceCap);
  const [pendingChanges, setPendingChanges] = useState<Change[]>([]);
  const [subjectsInUse, setSubjectsInUse] = useState<number[]>([]);
  const [locationsInUse, setLocationsInUse] = useState<number[]>([]);
  const [newSubject, setNewSubject] = useState<SubjectAPI>({
    id: 0,
    name: '',
    abbreviation: '',
    colorGroup: {
      // TODO: Add color group to the database
      name: 'Strings',
      colorCodes: ['#f44336', '#ff9800', '#ffeb3b'],
    },
    colorGroupId: 1,
    archived: false,
  });
  const [editingSubject, setEditingSubject] = useState<SubjectAPI | null>(null);
  const [newLocation, setNewLocation] = useState<Location>({
    id: 0,
    name: '',
    abbreviation: '',
    archived: false,
  });
  const [editingLocation, setEditingLocation] = useState<{
    id: number | null;
    name: string;
    abbreviation: string;
  } | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<number | null>(null);
  const confirmationDialog = useDisclosure();
  const toast = useToast();
  const theme = useTheme();
  const [colorGroups, setColorGroups] = useState<
    {
      id: number;
      name: string;
      colorCodes: string[];
    }[]
  >([]);

  // Create a ref to detect clicks outside the editing row
  const editingRowRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      fetchLocations();
      fetchColorGroups();
      checkSubjectsInUse();
      checkLocationsInUse();
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

  const fetchColorGroups = async () => {
    try {
      const response = await fetch('/api/colorGroups');
      if (!response.ok) throw new Error('Failed to fetch color groups');
      const data = await response.json();
      setColorGroups(data);
    } catch (error) {
      console.error('Error fetching color groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load color groups',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const checkSubjectsInUse = async () => {
    try {
      const response = await fetch('/api/subjects/inUse');
      if (!response.ok) throw new Error('Failed to check subjects in use');
      const data = await response.json();
      setSubjectsInUse(data.subjectsInUse || []);
    } catch (error) {
      console.error('Error checking subjects in use:', error);
    }
  };

  const checkLocationsInUse = async () => {
    try {
      const response = await fetch('/api/locations/inUse');
      if (!response.ok) throw new Error('Failed to check locations in use');
      const data = await response.json();
      setLocationsInUse(data.locationsInUse || []);
    } catch (error) {
      console.error('Error checking locations in use:', error);
    }
  };

  // Handle clicks outside the editing row
  React.useEffect(() => {
    // Only add the event listener if we're in edit mode
    if (!editingSubject && !editingLocation) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        editingRowRef.current &&
        !editingRowRef.current.contains(event.target as Node)
      ) {
        // Save the current editing state to local variables
        const currentEditingSubject = editingSubject;
        const currentEditingLocation = editingLocation;

        // Reset the editing state first to prevent infinite loops
        if (currentEditingSubject) {
          setEditingSubject(null);
          setColorPickerOpen(null);

          // Then apply the changes
          if (
            currentEditingSubject.name &&
            currentEditingSubject.abbreviation
          ) {
            const colorGroupId = currentEditingSubject.colorGroupId;
            if (colorGroupId) {
              handleAddChange({
                type: 'update',
                entity: 'subject',
                id: currentEditingSubject.id!,
                data: {
                  name: currentEditingSubject.name,
                  abbreviation: currentEditingSubject.abbreviation,
                  colorGroupId: colorGroupId,
                },
                displayText: `Updated Subject "${currentEditingSubject.name}"`,
              });
            }
          }
        } else if (currentEditingLocation) {
          setEditingLocation(null);

          // Then apply the changes
          if (
            currentEditingLocation.name &&
            currentEditingLocation.abbreviation
          ) {
            handleAddChange({
              type: 'update',
              entity: 'location',
              id: currentEditingLocation.id!,
              data: {
                name: currentEditingLocation.name,
                abbreviation: currentEditingLocation.abbreviation,
              },
              displayText: `Updated Location "${currentEditingLocation.name}"`,
            });
          }
        }
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingSubject, editingLocation, colorGroups]);

  const handleAddChange = (change: Change) => {
    // Remove any existing changes for the same entity and ID
    const filteredChanges = pendingChanges.filter(
      (c) => !(c.entity === change.entity && c.id === change.id)
    );

    setPendingChanges([...filteredChanges, change]);
  };

  const handleArchiveSubject = (subject: SubjectAPI) => {
    handleAddChange({
      type: subject.archived ? 'unarchive' : 'archive',
      entity: 'subject',
      id: subject.id,
      data: { archived: !subject.archived },
      displayText: `${subject.archived ? 'Unarchived' : 'Archived'} Subject "${subject.name}"`,
    });
  };

  const handleDeleteSubject = (subject: SubjectAPI) => {
    handleAddChange({
      type: 'delete',
      entity: 'subject',
      id: subject.id,
      displayText: `Deleted Subject "${subject.name}"`,
    });
  };

  const handleArchiveLocation = (location: Location) => {
    handleAddChange({
      type: location.archived ? 'unarchive' : 'archive',
      entity: 'location',
      id: location.id,
      data: { archived: !location.archived },
      displayText: `${location.archived ? 'Unarchived' : 'Archived'} Location "${location.name}"`,
    });
  };

  const handleDeleteLocation = (location: Location) => {
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

  const handleEditSubject = (subject: SubjectAPI) => {
    setEditingSubject(subject);
  };

  const handleSaveEditedSubject = () => {
    if (!editingSubject || !editingSubject.name || !editingSubject.abbreviation)
      return;

    // Store the current editing state
    const currentEditingSubject = { ...editingSubject };

    // Reset the editing state first
    setEditingSubject(null);
    setColorPickerOpen(null);

    // Find colorGroupId based on name
    const colorGroupId = currentEditingSubject.colorGroupId;
    if (!colorGroupId) return;

    // Update the local subjects array to immediately reflect changes in UI
    setSubjects(
      subjects.map((subject) =>
        subject.id === currentEditingSubject.id
          ? {
              ...subject,
              name: currentEditingSubject.name,
              abbreviation: currentEditingSubject.abbreviation,
              colorGroupId: colorGroupId,
              colorGroup: currentEditingSubject.colorGroup,
            }
          : subject
      )
    );

    handleAddChange({
      type: 'update',
      entity: 'subject',
      id: currentEditingSubject.id!,
      data: {
        name: currentEditingSubject.name,
        abbreviation: currentEditingSubject.abbreviation,
        colorGroupId: colorGroupId,
      },
      displayText: `Updated Subject "${currentEditingSubject.name}"`,
    });
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setEditingLocation(null);
    setIsAddingSubject(false);
    setIsAddingLocation(false);
    setColorPickerOpen(null);
  };

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.abbreviation) return;

    // Find colorGroupId based on name
    const colorGroupId = newSubject.colorGroupId;
    if (!colorGroupId) return;

    // Create a temporary ID for the new subject (negative to avoid conflicts)
    const tempId = -Date.now();

    // Create the new subject object
    const newSubjectObj: SubjectAPI = {
      id: tempId,
      name: newSubject.name,
      abbreviation: newSubject.abbreviation,
      colorGroup: colorGroups[colorGroupId - 1],
      colorGroupId: colorGroupId,
      archived: false,
    };

    // Add to the subjects array
    setSubjects([...subjects, newSubjectObj]);

    handleAddChange({
      type: 'add',
      entity: 'subject',
      data: {
        name: newSubject.name,
        abbreviation: newSubject.abbreviation,
        colorGroupId: colorGroupId,
      },
      displayText: `Added Subject "${newSubject.name}"`,
    });

    // Reset form and close it
    setNewSubject({
      id: 0,
      name: '',
      abbreviation: '',
      colorGroup: {
        // TODO make a default color group
        name: 'Strings',
        colorCodes: ['#f44336', '#ff9800', '#ffeb3b'],
      },
      colorGroupId: 1,
      archived: false,
    });
    setIsAddingSubject(false);
    setColorPickerOpen(null);
  };

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.abbreviation) return;

    // Create a temporary ID for the new location (negative to avoid conflicts)
    const tempId = -Date.now();

    // Create the new location object
    const newLocationObj: Location = {
      id: tempId,
      name: newLocation.name,
      abbreviation: newLocation.abbreviation,
      archived: false,
    };

    // Add to the locations array
    setLocations([...locations, newLocationObj]);

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
    setNewLocation({
      id: 0,
      name: '',
      abbreviation: '',
      archived: false,
    });
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
  };

  const handleSaveEditedLocation = () => {
    if (
      !editingLocation ||
      !editingLocation.name ||
      !editingLocation.abbreviation
    )
      return;

    // Store the current editing state
    const currentEditingLocation = { ...editingLocation };

    // Reset the editing state first
    setEditingLocation(null);

    // Update the local locations array to immediately reflect changes in UI
    setLocations(
      locations.map((location) =>
        location.id === currentEditingLocation.id
          ? {
              ...location,
              name: currentEditingLocation.name,
              abbreviation: currentEditingLocation.abbreviation,
            }
          : location
      )
    );

    handleAddChange({
      type: 'update',
      entity: 'location',
      id: currentEditingLocation.id!,
      data: {
        name: currentEditingLocation.name,
        abbreviation: currentEditingLocation.abbreviation,
      },
      displayText: `Updated Location "${currentEditingLocation.name}"`,
    });
  };

  const applyChanges = async () => {
    const results: ChangeResult[] = [];
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        scrollBehavior="outside"
        isCentered={false}
      >
        <ModalOverlay />
        <ModalContent
          minHeight={['90vh', '95vh', '100vh']}
          maxHeight="none"
          maxWidth="md"
          position="relative"
          overflow="visible"
        >
          <ModalHeader>
            <HStack justifyContent="space-between" width="100%">
              <HStack>
                <IoSettingsOutline
                  size={20}
                  color={theme.colors.neutralGray[600]}
                />
                <Box>
                  <Text>System Options</Text>
                </Box>
              </HStack>
              <IconButton
                aria-label="Close"
                icon={<IoCloseOutline size={20} />}
                variant="ghost"
                onClick={onClose}
                size="sm"
              />
            </HStack>
          </ModalHeader>
          <ModalBody
            padding={4}
            flex="1"
            position="relative"
            width="100%"
            overflow="visible"
          >
            <VStack align="stretch" spacing={6} width="100%">
              {/* Subjects Section */}
              <Box>
                <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                  {/* Table Header */}
                  <HStack
                    p={3}
                    bg="gray.50"
                    borderBottomWidth="1px"
                    justify="space-between"
                  >
                    <HStack spacing={1}>
                      <IoBookOutline />
                      <Text fontWeight="medium">Subject</Text>
                      <Box
                        as="span"
                        ml={1}
                        color="primaryBlue.300"
                        cursor="help"
                        position="relative"
                        _hover={{
                          '& > div': {
                            display: 'block',
                          },
                        }}
                      >
                        <LuInfo />
                        <Box
                          display="none"
                          position="absolute"
                          bg="gray.700"
                          color="white"
                          p={2}
                          borderRadius="md"
                          fontSize="sm"
                          zIndex={10}
                          top="100%"
                          left="50%"
                          transform="translateX(-50%)"
                          width="150px"
                          textAlign="center"
                        >
                          The full subject name
                        </Box>
                      </Box>
                    </HStack>
                    <HStack spacing={1}>
                      <FiType />
                      <Text fontWeight="medium">Display</Text>
                      <Box
                        as="span"
                        ml={1}
                        color="primaryBlue.300"
                        cursor="help"
                        position="relative"
                        _hover={{
                          '& > div': {
                            display: 'block',
                          },
                        }}
                      >
                        <LuInfo />
                        <Box
                          display="none"
                          position="absolute"
                          bg="gray.700"
                          color="white"
                          p={2}
                          borderRadius="md"
                          fontSize="sm"
                          zIndex={10}
                          top="100%"
                          right="0"
                          width="200px"
                          textAlign="center"
                        >
                          The abbreviated subject name
                        </Box>
                      </Box>
                    </HStack>
                  </HStack>

                  {/* Table Rows */}
                  {subjects.map((subject) => (
                    <Box key={subject.id} role="group">
                      <HStack
                        p={3}
                        spacing={4}
                        justify="space-between"
                        borderBottomWidth="1px"
                        _last={{ borderBottomWidth: 0 }}
                        ref={
                          editingSubject?.id === subject.id
                            ? editingRowRef
                            : undefined
                        }
                        bg={subject.archived ? 'neutralGray.100' : 'white'}
                      >
                        {editingSubject && editingSubject.id === subject.id ? (
                          // Editing mode
                          <>
                            <HStack flex="1">
                              <Box position="relative">
                                <Circle
                                  size="24px"
                                  bg={
                                    subject.colorGroup.colorCodes[
                                      COLOR_CODE_INDEX
                                    ]
                                  }
                                  cursor="pointer"
                                  onClick={() => setColorPickerOpen(subject.id)}
                                />
                                {colorPickerOpen === subject.id && (
                                  <Box
                                    position="absolute"
                                    top="100%"
                                    left="0"
                                    zIndex={10}
                                    bg="white"
                                    borderWidth="1px"
                                    borderRadius="md"
                                    boxShadow="md"
                                    p={2}
                                    width="150px"
                                  >
                                    <VStack align="stretch" spacing={2}>
                                      {colorGroups.map((group) => (
                                        <HStack
                                          key={group.name}
                                          p={1}
                                          borderRadius="md"
                                          cursor="pointer"
                                          _hover={{ bg: 'gray.100' }}
                                          onClick={() => {
                                            setEditingSubject({
                                              ...editingSubject,
                                              colorGroup: group,
                                            });
                                            setColorPickerOpen(null);
                                          }}
                                        >
                                          <Circle
                                            size="20px"
                                            bg={
                                              group.colorCodes[COLOR_CODE_INDEX]
                                            }
                                          />
                                          <Text fontSize="sm">
                                            {group.name}
                                          </Text>
                                        </HStack>
                                      ))}
                                    </VStack>
                                  </Box>
                                )}
                              </Box>
                              <Input
                                value={editingSubject.name}
                                onChange={(e) =>
                                  setEditingSubject({
                                    ...editingSubject,
                                    name: e.target.value,
                                  })
                                }
                                size="sm"
                              />
                            </HStack>
                            <HStack
                              justify="space-between"
                              flex="1"
                              maxW="200px"
                            >
                              <Input
                                value={editingSubject.abbreviation}
                                onChange={(e) =>
                                  setEditingSubject({
                                    ...editingSubject,
                                    abbreviation: e.target.value,
                                  })
                                }
                                size="sm"
                                maxW="80px"
                              />
                              <HStack>
                                <Button
                                  variant="outline"
                                  onClick={handleSaveEditedSubject}
                                  size="sm"
                                  borderRadius="md"
                                  p={0}
                                >
                                  <IoCheckmark
                                    size={20}
                                    color={theme.colors.gray[600]}
                                  />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  size="sm"
                                  borderRadius="md"
                                  p={0}
                                >
                                  <IoCloseOutline
                                    size={20}
                                    color={theme.colors.gray[600]}
                                  />
                                </Button>
                              </HStack>
                            </HStack>
                          </>
                        ) : (
                          // Display mode
                          <>
                            <HStack>
                              <Circle
                                size="24px"
                                bg={
                                  subject.colorGroup.colorCodes[
                                    COLOR_CODE_INDEX
                                  ]
                                }
                              />
                              {subject.archived && (
                                <LuArchive
                                  color={theme.colors.text.inactiveButtonText}
                                  size={16}
                                />
                              )}
                              <Text
                                color={
                                  subject.archived
                                    ? 'text.inactiveButtonText'
                                    : 'inherit'
                                }
                              >
                                {subject.name}
                              </Text>
                            </HStack>
                            <HStack
                              justify="space-between"
                              flex="1"
                              maxW="120px"
                            >
                              <Text
                                color={
                                  subject.archived
                                    ? 'text.inactiveButtonText'
                                    : 'inherit'
                                }
                              >
                                {subject.abbreviation}
                              </Text>
                              <Box
                                className="menu-button"
                                opacity="0"
                                _groupHover={{ opacity: '1' }}
                              >
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
                                      onClick={() => handleEditSubject(subject)}
                                    >
                                      Edit
                                    </MenuItem>
                                    <MenuItem
                                      icon={<IoArchiveOutline />}
                                      onClick={() =>
                                        handleArchiveSubject(subject)
                                      }
                                    >
                                      {subject.archived
                                        ? 'Unarchive'
                                        : 'Archive'}
                                    </MenuItem>
                                    <Tooltip
                                      label={
                                        subjectsInUse.includes(subject.id)
                                          ? 'Cannot delete subject because it is used in existing absences'
                                          : ''
                                      }
                                      isDisabled={
                                        !subjectsInUse.includes(subject.id)
                                      }
                                    >
                                      <MenuItem
                                        icon={<IoTrashOutline />}
                                        onClick={() =>
                                          handleDeleteSubject(subject)
                                        }
                                        color="red.500"
                                        isDisabled={subjectsInUse.includes(
                                          subject.id
                                        )}
                                        bg={
                                          subjectsInUse.includes(subject.id)
                                            ? 'neutralGray.100'
                                            : undefined
                                        }
                                        _hover={
                                          subjectsInUse.includes(subject.id)
                                            ? { bg: 'neutralGray.100' }
                                            : undefined
                                        }
                                        cursor={
                                          subjectsInUse.includes(subject.id)
                                            ? 'not-allowed'
                                            : 'pointer'
                                        }
                                      >
                                        Delete
                                      </MenuItem>
                                    </Tooltip>
                                  </MenuList>
                                </Menu>
                              </Box>
                            </HStack>
                          </>
                        )}
                      </HStack>
                    </Box>
                  ))}

                  {/* Add New Subject Row */}
                  {isAddingSubject ? (
                    <HStack
                      p={3}
                      spacing={4}
                      justify="space-between"
                      borderBottomWidth="1px"
                      ref={editingRowRef}
                    >
                      <HStack flex="1">
                        <Box position="relative">
                          <Circle
                            size="24px"
                            bg={
                              colorGroups.find(
                                (cg) => cg.name === newSubject.colorGroup.name
                              )?.colorCodes[COLOR_CODE_INDEX] || '#CBD5E0'
                            }
                            cursor="pointer"
                            onClick={() => setColorPickerOpen(-1)}
                          />
                          {colorPickerOpen === -1 && (
                            <Box
                              position="absolute"
                              top="100%"
                              left="0"
                              zIndex={10}
                              bg="white"
                              borderWidth="1px"
                              borderRadius="md"
                              boxShadow="md"
                              p={2}
                              width="150px"
                            >
                              <VStack align="stretch" spacing={2}>
                                {colorGroups.map((group) => (
                                  <HStack
                                    key={group.name}
                                    p={1}
                                    borderRadius="md"
                                    cursor="pointer"
                                    _hover={{ bg: 'gray.100' }}
                                    onClick={() => {
                                      setNewSubject({
                                        ...newSubject,
                                        colorGroup: group,
                                      });
                                      setColorPickerOpen(null);
                                    }}
                                  >
                                    <Circle
                                      size="20px"
                                      bg={group.colorCodes[COLOR_CODE_INDEX]}
                                    />
                                    <Text fontSize="sm">{group.name}</Text>
                                  </HStack>
                                ))}
                              </VStack>
                            </Box>
                          )}
                        </Box>
                        <Input
                          value={newSubject.name}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              name: e.target.value,
                            })
                          }
                          placeholder="Subject name"
                          size="sm"
                        />
                      </HStack>
                      <HStack justify="space-between" flex="1" maxW="200px">
                        <Input
                          value={newSubject.abbreviation}
                          onChange={(e) =>
                            setNewSubject({
                              ...newSubject,
                              abbreviation: e.target.value,
                            })
                          }
                          placeholder="Abbr."
                          size="sm"
                          maxW="80px"
                        />
                        <HStack>
                          <Button
                            variant="outline"
                            onClick={handleAddSubject}
                            size="sm"
                            borderRadius="md"
                            p={0}
                          >
                            <IoCheckmark
                              size={20}
                              color={theme.colors.gray[600]}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            size="sm"
                            borderRadius="md"
                            p={0}
                          >
                            <IoCloseOutline
                              size={20}
                              color={theme.colors.gray[600]}
                            />
                          </Button>
                        </HStack>
                      </HStack>
                    </HStack>
                  ) : null}

                  {/* Add Button */}
                  <HStack
                    p={3}
                    justify="flex-start"
                    borderTopWidth={subjects.length > 0 ? '1px' : '0'}
                    bg="gray.50"
                  >
                    <Button
                      leftIcon={<IoAdd />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAddingSubject(true)}
                    >
                      Add
                    </Button>
                  </HStack>
                </Box>
              </Box>

              {/* Locations Section */}
              <Box>
                <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                  {/* Table Header */}
                  <HStack
                    p={3}
                    bg="gray.50"
                    borderBottomWidth="1px"
                    justify="space-between"
                  >
                    <HStack spacing={1}>
                      <IoBookOutline />
                      <Text fontWeight="medium">Location</Text>
                      <Box
                        as="span"
                        ml={1}
                        color="primaryBlue.300"
                        cursor="help"
                        position="relative"
                        _hover={{
                          '& > div': {
                            display: 'block',
                          },
                        }}
                      >
                        <LuInfo />
                        <Box
                          display="none"
                          position="absolute"
                          bg="gray.700"
                          color="white"
                          p={2}
                          borderRadius="md"
                          fontSize="sm"
                          zIndex={10}
                          top="100%"
                          left="50%"
                          transform="translateX(-50%)"
                          width="150px"
                          textAlign="center"
                        >
                          The full location name
                        </Box>
                      </Box>
                    </HStack>
                    <HStack spacing={1}>
                      <FiType />
                      <Text fontWeight="medium">Display</Text>
                      <Box
                        as="span"
                        ml={1}
                        color="primaryBlue.300"
                        cursor="help"
                        position="relative"
                        _hover={{
                          '& > div': {
                            display: 'block',
                          },
                        }}
                      >
                        <LuInfo />
                        <Box
                          display="none"
                          position="absolute"
                          bg="gray.700"
                          color="white"
                          p={2}
                          borderRadius="md"
                          fontSize="sm"
                          zIndex={10}
                          top="100%"
                          right="0"
                          width="200px"
                          textAlign="center"
                        >
                          The abbreviated location name
                        </Box>
                      </Box>
                    </HStack>
                  </HStack>

                  {/* Table Rows */}
                  {locations.map((location) => (
                    <Box key={location.id} role="group">
                      <HStack
                        p={3}
                        spacing={4}
                        justify="space-between"
                        borderBottomWidth="1px"
                        _last={{ borderBottomWidth: 0 }}
                        ref={
                          editingLocation?.id === location.id
                            ? editingRowRef
                            : undefined
                        }
                        bg={location.archived ? 'neutralGray.100' : 'white'}
                      >
                        {editingLocation &&
                        editingLocation.id === location.id ? (
                          // Editing mode
                          <>
                            <Input
                              value={editingLocation.name}
                              onChange={(e) =>
                                setEditingLocation({
                                  ...editingLocation,
                                  name: e.target.value,
                                })
                              }
                              size="sm"
                              flex="1"
                            />
                            <HStack
                              justify="space-between"
                              flex="1"
                              maxW="200px"
                            >
                              <Input
                                value={editingLocation.abbreviation}
                                onChange={(e) =>
                                  setEditingLocation({
                                    ...editingLocation,
                                    abbreviation: e.target.value,
                                  })
                                }
                                size="sm"
                                maxW="80px"
                              />
                              <HStack>
                                <Button
                                  variant="outline"
                                  onClick={handleSaveEditedLocation}
                                  size="sm"
                                  borderRadius="md"
                                  p={0}
                                >
                                  <IoCheckmark
                                    size={20}
                                    color={theme.colors.gray[600]}
                                  />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  size="sm"
                                  borderRadius="md"
                                  p={0}
                                >
                                  <IoCloseOutline
                                    size={20}
                                    color={theme.colors.gray[600]}
                                  />
                                </Button>
                              </HStack>
                            </HStack>
                          </>
                        ) : (
                          // Display mode
                          <>
                            <HStack>
                              {location.archived && (
                                <LuArchive
                                  color={theme.colors.text.inactiveButtonText}
                                  size={16}
                                />
                              )}
                              <Text
                                color={
                                  location.archived
                                    ? 'text.inactiveButtonText'
                                    : 'inherit'
                                }
                              >
                                {location.name}
                              </Text>
                            </HStack>
                            <HStack
                              justify="space-between"
                              flex="1"
                              maxW="120px"
                            >
                              <Text
                                color={
                                  location.archived
                                    ? 'text.inactiveButtonText'
                                    : 'inherit'
                                }
                              >
                                {location.abbreviation}
                              </Text>
                              <Box
                                className="menu-button"
                                opacity="0"
                                _groupHover={{ opacity: '1' }}
                              >
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
                                      onClick={() =>
                                        handleEditLocation(location)
                                      }
                                    >
                                      Edit
                                    </MenuItem>
                                    <MenuItem
                                      icon={<IoArchiveOutline />}
                                      onClick={() =>
                                        handleArchiveLocation(location)
                                      }
                                    >
                                      {location.archived
                                        ? 'Unarchive'
                                        : 'Archive'}
                                    </MenuItem>
                                    <Tooltip
                                      label={
                                        locationsInUse.includes(location.id)
                                          ? 'Cannot delete location because it is used in existing absences'
                                          : ''
                                      }
                                      isDisabled={
                                        !locationsInUse.includes(location.id)
                                      }
                                    >
                                      <MenuItem
                                        icon={<IoTrashOutline />}
                                        onClick={() =>
                                          handleDeleteLocation(location)
                                        }
                                        color="red.500"
                                        isDisabled={locationsInUse.includes(
                                          location.id
                                        )}
                                        bg={
                                          locationsInUse.includes(location.id)
                                            ? 'neutralGray.100'
                                            : undefined
                                        }
                                        _hover={
                                          locationsInUse.includes(location.id)
                                            ? { bg: 'neutralGray.100' }
                                            : undefined
                                        }
                                        cursor={
                                          locationsInUse.includes(location.id)
                                            ? 'not-allowed'
                                            : 'pointer'
                                        }
                                      >
                                        Delete
                                      </MenuItem>
                                    </Tooltip>
                                  </MenuList>
                                </Menu>
                              </Box>
                            </HStack>
                          </>
                        )}
                      </HStack>
                    </Box>
                  ))}

                  {/* Add New Location Row */}
                  {isAddingLocation ? (
                    <HStack
                      p={3}
                      spacing={4}
                      justify="space-between"
                      borderBottomWidth="1px"
                      ref={editingRowRef}
                    >
                      <Input
                        value={newLocation.name}
                        onChange={(e) =>
                          setNewLocation({
                            ...newLocation,
                            name: e.target.value,
                          })
                        }
                        placeholder="Location name"
                        size="sm"
                        flex="1"
                      />
                      <HStack justify="space-between" flex="1" maxW="200px">
                        <Input
                          value={newLocation.abbreviation}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              abbreviation: e.target.value,
                            })
                          }
                          placeholder="Abbr."
                          size="sm"
                          maxW="80px"
                        />
                        <HStack>
                          <Button
                            variant="outline"
                            onClick={handleAddLocation}
                            size="sm"
                            borderRadius="md"
                            p={0}
                          >
                            <IoCheckmark
                              size={20}
                              color={theme.colors.gray[600]}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            size="sm"
                            borderRadius="md"
                            p={0}
                          >
                            <IoCloseOutline
                              size={20}
                              color={theme.colors.gray[600]}
                            />
                          </Button>
                        </HStack>
                      </HStack>
                    </HStack>
                  ) : null}

                  {/* Add Button */}
                  <HStack
                    p={3}
                    justify="flex-start"
                    borderTopWidth={locations.length > 0 ? '1px' : '0'}
                    bg="gray.50"
                  >
                    <Button
                      leftIcon={<IoAdd />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAddingLocation(true)}
                    >
                      Add
                    </Button>
                  </HStack>
                </Box>
              </Box>

              {/* Settings Section */}
              <Box>
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
        message={pendingChanges.map((change) => change.displayText).join('\n')}
      />
    </>
  );
};

export default SystemOptionsModal;
