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
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Constants for character limits
  const MAX_SUBJECT_ABBREVIATION_LENGTH = 9;
  const MAX_LOCATION_ABBREVIATION_LENGTH = 12;

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
  const editingRowRef = useRef<HTMLDivElement>(null);

  const [isConfirmingClose, setIsConfirmingClose] = useState(false);

  const fetchSubjects = useCallback(async () => {
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
  }, [toast]);

  const fetchLocations = useCallback(async () => {
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
  }, [toast]);

  const fetchColorGroups = useCallback(async () => {
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
  }, [toast]);

  const checkSubjectsInUse = useCallback(async () => {
    try {
      const response = await fetch('/api/subjects/inUse');
      if (!response.ok) throw new Error('Failed to check subjects in use');
      const data = await response.json();
      setSubjectsInUse(data.subjectsInUse || []);
    } catch (error) {
      console.error('Error checking subjects in use:', error);
    }
  }, []);

  const checkLocationsInUse = useCallback(async () => {
    try {
      const response = await fetch('/api/locations/inUse');
      if (!response.ok) throw new Error('Failed to check locations in use');
      const data = await response.json();
      setLocationsInUse(data.locationsInUse || []);
    } catch (error) {
      console.error('Error checking locations in use:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      fetchLocations();
      fetchColorGroups();
      checkSubjectsInUse();
      checkLocationsInUse();
    }
  }, [
    isOpen,
    fetchSubjects,
    fetchLocations,
    fetchColorGroups,
    checkSubjectsInUse,
    checkLocationsInUse,
  ]);

  const handleAddChange = (change: Change) => {
    setPendingChanges((prevChanges) => {
      // Create a unique key to track changes by entity type and ID
      const changeKey = `${change.entity}-${change.id || 'new'}`;

      // Group existing changes by this key for easier processing
      const changesByKey = new Map<string, Change[]>();
      prevChanges.forEach((c) => {
        const key = `${c.entity}-${c.id || 'new'}`;
        if (!changesByKey.has(key)) {
          changesByKey.set(key, []);
        }
        changesByKey.get(key)?.push(c);
      });

      const existingChanges = changesByKey.get(changeKey) || [];

      // Case 1: Entity is added and then deleted - remove both changes
      if (
        change.type === 'delete' &&
        existingChanges.some((c) => c.type === 'add') &&
        (change.id === undefined || change.id < 0)
      ) {
        // Remove all changes for this entity
        return prevChanges.filter(
          (c) => !(c.entity === change.entity && c.id === change.id)
        );
      }

      // Case 2: Entity is changed and then deleted - keep only the delete
      if (change.type === 'delete') {
        // Filter out any previous changes for this entity, keeping only the delete
        return [
          ...prevChanges.filter(
            (c) => !(c.entity === change.entity && c.id === change.id)
          ),
          change,
        ];
      }

      // Case 3: Entity is added and then modified - update the add operation
      if (
        change.type === 'update' &&
        existingChanges.some((c) => c.type === 'add') &&
        (change.id === undefined || change.id < 0)
      ) {
        // Find the add operation
        const addChange = existingChanges.find((c) => c.type === 'add');
        if (addChange) {
          // Update the add operation with the new data
          return prevChanges.map((c) => {
            if (c === addChange) {
              return {
                ...c,
                data: { ...c.data, ...change.data },
                displayText: `Added ${change.entity === 'subject' ? 'Subject' : 'Location'} "${change.data.name || c.data.name}"`,
              };
            }
            return c;
          });
        }
      }

      // Case 4: Entity is updated multiple times - merge the update operations
      if (change.type === 'update') {
        const existingUpdate = existingChanges.find((c) => c.type === 'update');

        if (existingUpdate) {
          // Merge this update with the existing update
          return prevChanges.map((c) => {
            if (c === existingUpdate) {
              return {
                ...c,
                data: { ...c.data, ...change.data },
                // Keep the original displayText as we'll generate detailed messages in getDisplayableChanges
                displayText: c.displayText,
              };
            }
            return c;
          });
        }
      }

      // For all other cases (including archive/unarchive operations and new updates)
      return [
        ...prevChanges.filter(
          (c) =>
            // Keep everything that's not an update to the same entity
            // (allows keeping archive/unarchive operations separate)
            !(
              c.entity === change.entity &&
              c.id === change.id &&
              c.type === change.type
            )
        ),
        change,
      ];
    });
  };

  // Handle clicks outside the editing row
  useEffect(() => {
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
              // Find the original subject to compare changes
              const originalSubject = subjects.find(
                (s) => s.id === currentEditingSubject.id
              );
              if (!originalSubject) return;

              // Only include fields that have changed
              const changedData: any = {};

              if (originalSubject.name !== currentEditingSubject.name) {
                changedData.name = currentEditingSubject.name;
              }

              if (
                originalSubject.abbreviation !==
                currentEditingSubject.abbreviation
              ) {
                changedData.abbreviation = currentEditingSubject.abbreviation;
              }

              if (originalSubject.colorGroupId !== colorGroupId) {
                changedData.colorGroupId = colorGroupId;
              }

              // Only proceed if there are actual changes
              if (Object.keys(changedData).length > 0) {
                handleAddChange({
                  type: 'update',
                  entity: 'subject',
                  id: currentEditingSubject.id!,
                  data: changedData,
                  displayText: `Updated Subject "${currentEditingSubject.name}"`,
                });
              }
            }
          }
        } else if (currentEditingLocation) {
          setEditingLocation(null);

          // Then apply the changes
          if (
            currentEditingLocation.name &&
            currentEditingLocation.abbreviation
          ) {
            // Find the original location to compare changes
            const originalLocation = locations.find(
              (l) => l.id === currentEditingLocation.id
            );
            if (!originalLocation) return;

            // Only include fields that have changed
            const changedData: any = {};

            if (originalLocation.name !== currentEditingLocation.name) {
              changedData.name = currentEditingLocation.name;
            }

            if (
              originalLocation.abbreviation !==
              currentEditingLocation.abbreviation
            ) {
              changedData.abbreviation = currentEditingLocation.abbreviation;
            }

            // Only proceed if there are actual changes
            if (Object.keys(changedData).length > 0) {
              handleAddChange({
                type: 'update',
                entity: 'location',
                id: currentEditingLocation.id!,
                data: changedData,
                displayText: `Updated Location "${currentEditingLocation.name}"`,
              });
            }
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
  }, [
    editingSubject,
    editingLocation,
    colorGroups,
    handleAddChange,
    subjects,
    locations,
  ]);

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

    // Validate abbreviation length
    if (editingSubject.abbreviation.length > MAX_SUBJECT_ABBREVIATION_LENGTH) {
      toast({
        title: 'Error',
        description: `Subject abbreviation must be ${MAX_SUBJECT_ABBREVIATION_LENGTH} characters or less`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Store the current editing state
    const currentEditingSubject = { ...editingSubject };

    // Reset the editing state first
    setEditingSubject(null);
    setColorPickerOpen(null);

    // Find colorGroupId based on name
    const colorGroupId = currentEditingSubject.colorGroupId;
    if (!colorGroupId) return;

    // Find the original subject to compare changes
    const originalSubject = subjects.find(
      (s) => s.id === currentEditingSubject.id
    );
    if (!originalSubject) return;

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

    // Only include fields that have changed
    const changedData: any = {};

    if (originalSubject.name !== currentEditingSubject.name) {
      changedData.name = currentEditingSubject.name;
    }

    if (originalSubject.abbreviation !== currentEditingSubject.abbreviation) {
      changedData.abbreviation = currentEditingSubject.abbreviation;
    }

    if (originalSubject.colorGroupId !== colorGroupId) {
      changedData.colorGroupId = colorGroupId;
    }

    // Only proceed if there are actual changes
    if (Object.keys(changedData).length > 0) {
      handleAddChange({
        type: 'update',
        entity: 'subject',
        id: currentEditingSubject.id!,
        data: changedData,
        displayText: `Updated Subject "${currentEditingSubject.name}"`,
      });
    }
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

    // Validate abbreviation length
    if (newSubject.abbreviation.length > MAX_SUBJECT_ABBREVIATION_LENGTH) {
      toast({
        title: 'Error',
        description: `Subject abbreviation must be ${MAX_SUBJECT_ABBREVIATION_LENGTH} characters or less`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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

    // Validate abbreviation length
    if (newLocation.abbreviation.length > MAX_LOCATION_ABBREVIATION_LENGTH) {
      toast({
        title: 'Error',
        description: `Location abbreviation must be ${MAX_LOCATION_ABBREVIATION_LENGTH} characters or less`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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

    // Validate abbreviation length
    if (
      editingLocation.abbreviation.length > MAX_LOCATION_ABBREVIATION_LENGTH
    ) {
      toast({
        title: 'Error',
        description: `Location abbreviation must be ${MAX_LOCATION_ABBREVIATION_LENGTH} characters or less`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Store the current editing state
    const currentEditingLocation = { ...editingLocation };

    // Reset the editing state first
    setEditingLocation(null);

    // Find the original location to compare changes
    const originalLocation = locations.find(
      (l) => l.id === currentEditingLocation.id
    );
    if (!originalLocation) return;

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

    // Only include fields that have changed
    const changedData: any = {};

    if (originalLocation.name !== currentEditingLocation.name) {
      changedData.name = currentEditingLocation.name;
    }

    if (originalLocation.abbreviation !== currentEditingLocation.abbreviation) {
      changedData.abbreviation = currentEditingLocation.abbreviation;
    }

    // Only proceed if there are actual changes
    if (Object.keys(changedData).length > 0) {
      handleAddChange({
        type: 'update',
        entity: 'location',
        id: currentEditingLocation.id!,
        data: changedData,
        displayText: `Updated Location "${currentEditingLocation.name}"`,
      });
    }
  };

  const handleClose = () => {
    if (pendingChanges.length > 0) {
      setIsConfirmingClose(true);
      confirmationDialog.onOpen();
    } else {
      onClose();
    }
  };

  const handleCloseConfirmed = () => {
    confirmationDialog.onClose();
    setIsConfirmingClose(false);
    // Clear any pending changes
    setPendingChanges([]);
    onClose();
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
    setIsConfirmingClose(false);
  };

  const handleSave = () => {
    if (pendingChanges.length > 0) {
      // Log the pending changes to help debug
      console.log('Pending changes before confirmation:', pendingChanges);
      setIsConfirmingClose(false);
      confirmationDialog.onOpen();
    } else {
      onClose();
    }
  };

  const getDisplayableChanges = (changes: Change[]): string[] => {
    const displayChanges: string[] = [];

    console.log('Generating displayable changes from:', changes);

    if (changes.length === 0) {
      return ['No changes to apply'];
    }

    // Process each change to create more granular display items
    changes.forEach((change) => {
      console.log('Processing change:', change);
      console.log('Change data:', change.data);

      if (change.type === 'add') {
        displayChanges.push(
          `Added ${change.entity === 'subject' ? 'Subject' : 'Location'} "${change.data.name}"`
        );
        if (change.data.abbreviation) {
          displayChanges.push(`· Set Display to "${change.data.abbreviation}"`);
        }
        if (change.entity === 'subject' && change.data.colorGroupId) {
          const colorGroup = colorGroups.find(
            (cg) => cg.id === change.data.colorGroupId
          );
          if (colorGroup) {
            displayChanges.push(`· Set Color to "${colorGroup.name}"`);
          }
        }
      } else if (change.type === 'delete') {
        displayChanges.push(
          `Deleted ${change.entity === 'subject' ? 'Subject' : 'Location'} "${
            // Try to find the name from the entities array
            change.entity === 'subject'
              ? subjects.find((s) => s.id === change.id)?.name || 'Unknown'
              : locations.find((l) => l.id === change.id)?.name || 'Unknown'
          }"`
        );
      } else if (change.type === 'archive' || change.type === 'unarchive') {
        const entityName =
          change.entity === 'subject'
            ? subjects.find((s) => s.id === change.id)?.name
            : locations.find((l) => l.id === change.id)?.name;

        displayChanges.push(
          `${change.type === 'archive' ? 'Archived' : 'Unarchived'} ${
            change.entity === 'subject' ? 'Subject' : 'Location'
          } "${entityName || 'Unknown'}"`
        );
      } else if (change.type === 'update') {
        // Since we're filtering changes in the handleSaveEdited functions,
        // and merging multiple updates to the same entity in handleAddChange,
        // any field present in change.data represents an actual change

        // Name changes
        if (change.data.name !== undefined) {
          const entityList = change.entity === 'subject' ? subjects : locations;
          const entity = entityList.find((e) => e.id === change.id);
          const oldName = entity?.name || 'Unknown';

          displayChanges.push(
            `Updated ${change.entity === 'subject' ? 'Subject' : 'Location'} Name "${oldName}" → "${change.data.name}"`
          );
        }

        // Abbreviation changes
        if (change.data.abbreviation !== undefined) {
          const entityList = change.entity === 'subject' ? subjects : locations;
          const entity = entityList.find((e) => e.id === change.id);
          const oldAbbr = entity?.abbreviation || 'Unknown';

          displayChanges.push(
            `Updated Display "${oldAbbr}" → "${change.data.abbreviation}"`
          );
        }

        // Color changes for subjects
        if (
          change.entity === 'subject' &&
          change.data.colorGroupId !== undefined
        ) {
          const subject = subjects.find((s) => s.id === change.id);
          const oldColorGroup = colorGroups.find(
            (cg) => cg.id === subject?.colorGroupId
          );
          const newColorGroup = colorGroups.find(
            (cg) => cg.id === change.data.colorGroupId
          );

          if (oldColorGroup && newColorGroup) {
            displayChanges.push(
              `Updated Color "${oldColorGroup.name}" → "${newColorGroup.name}"`
            );
          }
        }
      } else if (change.entity === 'setting') {
        if (change.data.absenceCap !== undefined) {
          displayChanges.push(
            `Updated Allowed Absences ${absenceCap} → ${change.data.absenceCap}`
          );
        }
      }
    });

    console.log('Final displayable changes:', displayChanges);

    // If we still have no changes to display but changes exist,
    // provide a fallback message
    if (displayChanges.length === 0 && changes.length > 0) {
      // Examine the first change to provide some information
      const firstChange = changes[0];
      displayChanges.push(`Changes will be applied to ${firstChange.entity}`);
    }

    return displayChanges;
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
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
                onClick={handleClose}
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
                  <Box
                    p={3}
                    bg="gray.50"
                    borderBottomWidth="1px"
                    display="flex"
                    width="100%"
                  >
                    <Box width="70%" pl={2}>
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
                    </Box>
                    <Box width="30%">
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
                            <br />
                            (max {MAX_SUBJECT_ABBREVIATION_LENGTH} characters)
                          </Box>
                        </Box>
                      </HStack>
                    </Box>
                  </Box>

                  {/* Table Rows */}
                  {subjects.map((subject) => (
                    <Box
                      p={3}
                      borderBottomWidth="1px"
                      _last={{ borderBottomWidth: 0 }}
                      ref={
                        editingSubject?.id === subject.id
                          ? editingRowRef
                          : undefined
                      }
                      bg={subject.archived ? 'neutralGray.100' : 'white'}
                      display="flex"
                      width="100%"
                      role="group"
                      key={subject.id}
                    >
                      {editingSubject && editingSubject.id === subject.id ? (
                        <>
                          <Box width="70%" pl={2}>
                            <HStack>
                              <Box position="relative">
                                <Circle
                                  size="24px"
                                  bg={
                                    editingSubject.colorGroup.colorCodes[
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
                                    width="auto"
                                  >
                                    <Box
                                      display="grid"
                                      gridTemplateColumns="repeat(4, 1fr)"
                                      gap={2}
                                    >
                                      {colorGroups.map((group) => (
                                        <Circle
                                          key={group.id}
                                          size="24px"
                                          bg={
                                            group.colorCodes[COLOR_CODE_INDEX]
                                          }
                                          border="2px solid"
                                          borderColor={
                                            editingSubject?.colorGroup?.name ===
                                            group.name
                                              ? `${group.colorCodes[0]}` // Use darker color from array for selected item
                                              : 'transparent'
                                          }
                                          cursor="pointer"
                                          onClick={() => {
                                            setEditingSubject({
                                              ...editingSubject,
                                              colorGroup: group,
                                              colorGroupId: group.id,
                                            });
                                            setColorPickerOpen(null);
                                          }}
                                        />
                                      ))}
                                    </Box>
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
                                flex="1"
                              />
                            </HStack>
                          </Box>
                          <Box
                            width="30%"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
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
                              maxW="60px"
                              maxLength={MAX_SUBJECT_ABBREVIATION_LENGTH}
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
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box width="70%" pl={2}>
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
                              <Tooltip
                                label={subject.name}
                                placement="top"
                                openDelay={300}
                                isDisabled={subject.name.length <= 20}
                              >
                                <Box
                                  position="relative"
                                  width="100%"
                                  maxWidth="170px"
                                  overflow="hidden"
                                >
                                  <Text
                                    color={
                                      subject.archived
                                        ? 'text.inactiveButtonText'
                                        : 'inherit'
                                    }
                                    noOfLines={1}
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    position="relative"
                                    pr="30px"
                                  >
                                    {subject.name}
                                  </Text>
                                  <Box
                                    position="absolute"
                                    right="0"
                                    top="0"
                                    height="100%"
                                    width="30px"
                                    background={`linear-gradient(to right, transparent, ${subject.archived ? 'var(--chakra-colors-neutralGray-100)' : 'white'})`}
                                    zIndex="1"
                                    pointerEvents="none"
                                  />
                                </Box>
                              </Tooltip>
                            </HStack>
                          </Box>
                          <Box
                            width="30%"
                            display="flex"
                            justifyContent="space-between"
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
                                    {subject.archived ? 'Unarchive' : 'Archive'}
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
                          </Box>
                        </>
                      )}
                    </Box>
                  ))}

                  {/* Add New Subject Row */}
                  {isAddingSubject ? (
                    <Box
                      p={3}
                      borderBottomWidth="1px"
                      display="flex"
                      width="100%"
                      ref={editingRowRef}
                    >
                      <Box width="70%" pl={2}>
                        <HStack>
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
                                width="auto"
                              >
                                <Box
                                  display="grid"
                                  gridTemplateColumns="repeat(4, 1fr)"
                                  gap={2}
                                >
                                  {colorGroups.map((group) => (
                                    <Circle
                                      key={group.id}
                                      size="24px"
                                      bg={group.colorCodes[COLOR_CODE_INDEX]}
                                      border="2px solid"
                                      borderColor={
                                        newSubject?.colorGroup?.name ===
                                        group.name
                                          ? `${group.colorCodes[0]}` // Use darker color from array for selected item
                                          : 'transparent'
                                      }
                                      cursor="pointer"
                                      onClick={() => {
                                        setNewSubject({
                                          ...newSubject,
                                          colorGroup: group,
                                          colorGroupId: group.id,
                                        });
                                        setColorPickerOpen(null);
                                      }}
                                    />
                                  ))}
                                </Box>
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
                            flex="1"
                          />
                        </HStack>
                      </Box>
                      <Box
                        width="30%"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
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
                          maxW="60px"
                          maxLength={MAX_SUBJECT_ABBREVIATION_LENGTH}
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
                      </Box>
                    </Box>
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
                  <Box
                    p={3}
                    bg="gray.50"
                    borderBottomWidth="1px"
                    display="flex"
                    width="100%"
                  >
                    <Box width="70%" pl={2}>
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
                    </Box>
                    <Box width="30%">
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
                            <br />
                            (max {MAX_LOCATION_ABBREVIATION_LENGTH} characters)
                          </Box>
                        </Box>
                      </HStack>
                    </Box>
                  </Box>

                  {/* Table Rows */}
                  {locations.map((location) => (
                    <Box
                      p={3}
                      borderBottomWidth="1px"
                      _last={{ borderBottomWidth: 0 }}
                      ref={
                        editingLocation?.id === location.id
                          ? editingRowRef
                          : undefined
                      }
                      bg={location.archived ? 'neutralGray.100' : 'white'}
                      display="flex"
                      width="100%"
                      role="group"
                      key={location.id}
                    >
                      {editingLocation && editingLocation.id === location.id ? (
                        <>
                          <Box width="70%" pl={2}>
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
                          </Box>
                          <Box
                            width="30%"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
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
                              maxW="60px"
                              maxLength={MAX_LOCATION_ABBREVIATION_LENGTH}
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
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box width="70%" pl={2}>
                            <HStack>
                              {location.archived && (
                                <LuArchive
                                  color={theme.colors.text.inactiveButtonText}
                                  size={16}
                                />
                              )}
                              <Tooltip
                                label={location.name}
                                placement="top"
                                openDelay={300}
                                isDisabled={location.name.length <= 20}
                              >
                                <Box
                                  position="relative"
                                  width="100%"
                                  maxWidth="170px"
                                  overflow="hidden"
                                >
                                  <Text
                                    color={
                                      location.archived
                                        ? 'text.inactiveButtonText'
                                        : 'inherit'
                                    }
                                    noOfLines={1}
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    position="relative"
                                    pr="30px"
                                  >
                                    {location.name}
                                  </Text>
                                  <Box
                                    position="absolute"
                                    right="0"
                                    top="0"
                                    height="100%"
                                    width="30px"
                                    background={`linear-gradient(to right, transparent, ${location.archived ? 'var(--chakra-colors-neutralGray-100)' : 'white'})`}
                                    zIndex="1"
                                    pointerEvents="none"
                                  />
                                </Box>
                              </Tooltip>
                            </HStack>
                          </Box>
                          <Box
                            width="30%"
                            display="flex"
                            justifyContent="space-between"
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
                                    onClick={() => handleEditLocation(location)}
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
                          </Box>
                        </>
                      )}
                    </Box>
                  ))}

                  {/* Add New Location Row */}
                  {isAddingLocation ? (
                    <Box
                      p={3}
                      borderBottomWidth="1px"
                      display="flex"
                      width="100%"
                      ref={editingRowRef}
                    >
                      <Box width="70%" pl={2}>
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
                      </Box>
                      <Box
                        width="30%"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
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
                          maxW="60px"
                          maxLength={MAX_LOCATION_ABBREVIATION_LENGTH}
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
                      </Box>
                    </Box>
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
            <Button variant="ghost" mr={3} onClick={handleClose}>
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
        onConfirm={isConfirmingClose ? handleCloseConfirmed : applyChanges}
        title={
          isConfirmingClose
            ? 'Discard Changes?'
            : 'You are making the following changes'
        }
        message={
          isConfirmingClose
            ? 'You have unsaved changes. Are you sure you want to close without saving?'
            : getDisplayableChanges(pendingChanges).join('\n')
        }
      />
    </>
  );
};

export default SystemOptionsModal;
