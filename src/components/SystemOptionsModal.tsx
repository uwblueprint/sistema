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
  IconButton,
  useDisclosure,
  useToast,
  useTheme,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IoSettingsOutline, IoCloseOutline } from 'react-icons/io5';
import { Subject, SubjectAPI, Location } from '@utils/types';
import React from 'react';
import SystemChangesConfirmationDialog, {
  Change,
} from './SystemChangesConfirmationDialog';
import SubjectsTable from './SubjectsTable';
import LocationsTable from './LocationsTable';
import SystemSettings from './SystemSettings';

interface SystemOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  absenceCap: number;
}

const SystemOptionsModal: React.FC<SystemOptionsModalProps> = ({
  isOpen,
  onClose,
  absenceCap,
}) => {
  // Constants for character limits
  const MAX_SUBJECT_ABBREVIATION_LENGTH = 9;
  const MAX_LOCATION_ABBREVIATION_LENGTH = 12;

  const [subjects, setSubjects] = useState<SubjectAPI[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [allowedAbsences, setAllowedAbsences] = useState<number>(absenceCap);
  const [pendingChanges, setPendingChanges] = useState<Change[]>([]);
  const [subjectsInUse, setSubjectsInUse] = useState<number[]>([]);
  const [locationsInUse, setLocationsInUse] = useState<number[]>([]);
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

  const handleAddChange = useCallback(
    (change: Change) => {
      // For display name/abbreviation changes, ensure we store the original values
      if (change.type === 'update') {
        // Find the entity to get its current values before changes
        const entityList = change.entity === 'subject' ? subjects : locations;
        const entity = entityList.find((e) => e.id === change.id);

        if (entity) {
          const originalValues: Record<string, any> = {};

          // Store original values for each field being changed
          if (change.data?.abbreviation !== undefined) {
            originalValues.originalAbbreviation = entity.abbreviation;
          }

          if (change.data?.name !== undefined) {
            originalValues.originalName = entity.name;
          }

          // ColorGroupId only exists on Subject entities
          if (
            change.data?.colorGroupId !== undefined &&
            change.entity === 'subject'
          ) {
            // Safe type cast since we've verified this is a subject
            originalValues.originalColorGroupId = (
              entity as SubjectAPI
            ).colorGroupId;
          }

          // Add original values to the change data
          change = {
            ...change,
            data: {
              ...change.data,
              ...originalValues,
            },
          };
        }
      }

      setPendingChanges((prevChanges) => {
        // Check if this is a newly added entity being updated
        // Look for any 'add' changes for the same entity type
        const addChangesForSameEntityType = prevChanges.filter(
          (c) => c.type === 'add' && c.entity === change.entity
        );

        // For update changes, check if we're updating a newly added entity
        if (
          change.type === 'update' &&
          addChangesForSameEntityType.length > 0
        ) {
          // Find the newly added entity with the same ID (for negative IDs which indicate new entities)
          // or find newly added entities with no ID
          const matchingAddChange = addChangesForSameEntityType.find(
            (c) =>
              (change.id && change.id < 0 && c.id === change.id) ||
              (c.id === undefined && change.id === undefined)
          );

          if (matchingAddChange) {
            // We found a matching add change - update it instead of creating a new change
            return prevChanges.map((c) => {
              if (c === matchingAddChange) {
                // Merge the data from the update into the add operation
                const mergedData = { ...c.data };

                // Apply updates
                if (change.data?.name !== undefined) {
                  mergedData.name = change.data.name;
                }
                if (change.data?.abbreviation !== undefined) {
                  mergedData.abbreviation = change.data.abbreviation;
                }
                if (
                  change.data?.colorGroupId !== undefined &&
                  change.entity === 'subject'
                ) {
                  mergedData.colorGroupId = change.data.colorGroupId;
                }

                return {
                  ...c,
                  data: mergedData,
                  id: change.id || c.id, // Ensure ID is consistent
                  displayText: `Added ${change.entity === 'subject' ? 'Subject' : 'Location'} "${mergedData.name}"`,
                };
              }
              return c;
            });
          }
        }

        // If we got here, it's not an update to a newly added entity
        // Continue with normal change processing...

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

        // Case 3: Entity is updated multiple times - merge the update operations
        if (change.type === 'update') {
          const existingUpdate = existingChanges.find(
            (c) => c.type === 'update'
          );

          if (existingUpdate) {
            // Merge this update with the existing update, but preserve original values
            // First, calculate what the merged data would look like
            const mergedData = { ...existingUpdate.data, ...change.data };

            // Extract original values
            const originalName =
              existingUpdate.data?.originalName || change.data?.originalName;
            const originalAbbreviation =
              existingUpdate.data?.originalAbbreviation ||
              change.data?.originalAbbreviation;
            const originalColorGroupId =
              existingUpdate.data?.originalColorGroupId ||
              change.data?.originalColorGroupId;

            // Check if all changed values now match their original values
            let allChangesReverted = true;

            // If name was changed
            if (mergedData.name !== undefined) {
              allChangesReverted =
                allChangesReverted && mergedData.name === originalName;
            }

            // If abbreviation was changed
            if (mergedData.abbreviation !== undefined) {
              allChangesReverted =
                allChangesReverted &&
                mergedData.abbreviation === originalAbbreviation;
            }

            // If colorGroupId was changed (only applies to subjects)
            if (
              change.entity === 'subject' &&
              mergedData.colorGroupId !== undefined
            ) {
              allChangesReverted =
                allChangesReverted &&
                mergedData.colorGroupId === originalColorGroupId;
            }

            // If all changes have been reverted, remove this change entirely
            if (allChangesReverted) {
              return prevChanges.filter((c) => c !== existingUpdate);
            }

            // Otherwise, merge the changes as usual
            return prevChanges.map((c) => {
              if (c === existingUpdate) {
                // Extract any original values from both changes
                const preservedOriginalValues: Record<string, any> = {};

                // Keep original values from the existing update
                if (c.data?.originalName) {
                  preservedOriginalValues.originalName = c.data.originalName;
                }
                if (c.data?.originalAbbreviation) {
                  preservedOriginalValues.originalAbbreviation =
                    c.data.originalAbbreviation;
                }
                // ColorGroupId is only applicable for subjects
                if (
                  change.entity === 'subject' &&
                  c.data?.originalColorGroupId
                ) {
                  preservedOriginalValues.originalColorGroupId =
                    c.data.originalColorGroupId;
                }

                // Only use new original values if the existing update doesn't have them
                if (!c.data?.originalName && change.data?.originalName) {
                  preservedOriginalValues.originalName =
                    change.data.originalName;
                }
                if (
                  !c.data?.originalAbbreviation &&
                  change.data?.originalAbbreviation
                ) {
                  preservedOriginalValues.originalAbbreviation =
                    change.data.originalAbbreviation;
                }
                // ColorGroupId is only applicable for subjects
                if (
                  change.entity === 'subject' &&
                  !c.data?.originalColorGroupId &&
                  change.data?.originalColorGroupId
                ) {
                  preservedOriginalValues.originalColorGroupId =
                    change.data.originalColorGroupId;
                }

                return {
                  ...c,
                  data: {
                    // Spread new data from change (overwrites old values)
                    ...change.data,
                    // Preserve all original values (don't overwrite with new ones)
                    ...preservedOriginalValues,
                  },
                  // Keep the original displayText
                  displayText: c.displayText,
                };
              }
              return c;
            });
          }
        }

        // For all other cases (including archive/unarchive operations and new changes)
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
    },
    [subjects, locations]
  );

  // Handle data changes (needed to update UI when adding/updating entities)
  useEffect(() => {
    // Update the subjects state when a subject is added or modified
    const handleSubjectChanges = () => {
      const subjectChanges = pendingChanges.filter(
        (change) => change.entity === 'subject'
      );

      if (subjectChanges.length > 0) {
        // Create a copy of the current subjects
        let updatedSubjects = [...subjects];

        // Process each change
        subjectChanges.forEach((change) => {
          if (change.type === 'add') {
            // Add new subject with temporary ID
            const newSubject: SubjectAPI = {
              id: change.id || -Date.now(),
              name: change.data.name,
              abbreviation: change.data.abbreviation,
              colorGroupId: change.data.colorGroupId,
              colorGroup: colorGroups.find(
                (cg) => cg.id === change.data.colorGroupId
              ) || {
                name: 'Default',
                colorCodes: ['#000000', '#000000', '#000000'],
              },
              archived: false,
            };

            // Check if this subject already exists in our list (for when we reload from API)
            const existingIndex = updatedSubjects.findIndex(
              (s) => s.id === newSubject.id
            );
            if (existingIndex === -1) {
              updatedSubjects.push(newSubject);
            }
          } else if (change.type === 'update') {
            // Update existing subject
            updatedSubjects = updatedSubjects.map((subject) =>
              subject.id === change.id
                ? {
                    ...subject,
                    ...(change.data.name && { name: change.data.name }),
                    ...(change.data.abbreviation && {
                      abbreviation: change.data.abbreviation,
                    }),
                    ...(change.data.colorGroupId && {
                      colorGroupId: change.data.colorGroupId,
                      colorGroup:
                        colorGroups.find(
                          (cg) => cg.id === change.data.colorGroupId
                        ) || subject.colorGroup,
                    }),
                  }
                : subject
            );
          } else if (change.type === 'delete') {
            // Remove subject
            updatedSubjects = updatedSubjects.filter(
              (subject) => subject.id !== change.id
            );
          } else if (change.type === 'archive' || change.type === 'unarchive') {
            // Archive/unarchive subject
            updatedSubjects = updatedSubjects.map((subject) =>
              subject.id === change.id
                ? { ...subject, archived: change.data.archived }
                : subject
            );
          }
        });

        // Only update if the subjects have actually changed
        if (JSON.stringify(updatedSubjects) !== JSON.stringify(subjects)) {
          setSubjects(updatedSubjects);
        }
      }
    };

    // Update the locations state when a location is added or modified
    const handleLocationChanges = () => {
      const locationChanges = pendingChanges.filter(
        (change) => change.entity === 'location'
      );

      if (locationChanges.length > 0) {
        // Create a copy of the current locations
        let updatedLocations = [...locations];

        // Process each change
        locationChanges.forEach((change) => {
          if (change.type === 'add') {
            // Add new location with temporary ID
            const newLocation: Location = {
              id: change.id || -Date.now(),
              name: change.data.name,
              abbreviation: change.data.abbreviation,
              archived: false,
            };

            // Check if this location already exists in our list (for when we reload from API)
            const existingIndex = updatedLocations.findIndex(
              (l) => l.id === newLocation.id
            );
            if (existingIndex === -1) {
              updatedLocations.push(newLocation);
            }
          } else if (change.type === 'update') {
            // Update existing location
            updatedLocations = updatedLocations.map((location) =>
              location.id === change.id
                ? {
                    ...location,
                    ...(change.data.name && { name: change.data.name }),
                    ...(change.data.abbreviation && {
                      abbreviation: change.data.abbreviation,
                    }),
                  }
                : location
            );
          } else if (change.type === 'delete') {
            // Remove location
            updatedLocations = updatedLocations.filter(
              (location) => location.id !== change.id
            );
          } else if (change.type === 'archive' || change.type === 'unarchive') {
            // Archive/unarchive location
            updatedLocations = updatedLocations.map((location) =>
              location.id === change.id
                ? { ...location, archived: change.data.archived }
                : location
            );
          }
        });

        // Only update if the locations have actually changed
        if (JSON.stringify(updatedLocations) !== JSON.stringify(locations)) {
          setLocations(updatedLocations);
        }
      }
    };

    // Update the allowed absences when changed
    const handleSettingChanges = () => {
      const settingChanges = pendingChanges.filter(
        (change) => change.entity === 'setting'
      );

      if (settingChanges.length > 0) {
        // Find the most recent absenceCap change
        const absenceCapChange = settingChanges
          .filter((change) => change.data?.absenceCap !== undefined)
          .pop();

        if (
          absenceCapChange &&
          absenceCapChange.data?.absenceCap !== undefined
        ) {
          setAllowedAbsences(absenceCapChange.data.absenceCap);
        }
      }
    };

    handleSubjectChanges();
    handleLocationChanges();
    handleSettingChanges();
  }, [pendingChanges, subjects, locations, colorGroups]);

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
    const results: { success: boolean; message: string }[] = [];
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
                <SubjectsTable
                  subjects={subjects}
                  colorGroups={colorGroups}
                  subjectsInUse={subjectsInUse}
                  handleAddChange={handleAddChange}
                  maxAbbreviationLength={MAX_SUBJECT_ABBREVIATION_LENGTH}
                />
              </Box>

              {/* Locations Section */}
              <Box>
                <LocationsTable
                  locations={locations}
                  locationsInUse={locationsInUse}
                  handleAddChange={handleAddChange}
                  maxAbbreviationLength={MAX_LOCATION_ABBREVIATION_LENGTH}
                />
              </Box>

              {/* Settings Section */}
              <SystemSettings
                allowedAbsences={allowedAbsences}
                originalAbsenceCap={absenceCap}
                handleAddChange={handleAddChange}
              />
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

      <SystemChangesConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={confirmationDialog.onClose}
        onConfirm={isConfirmingClose ? handleCloseConfirmed : applyChanges}
        pendingChanges={pendingChanges}
        isConfirmingClose={isConfirmingClose}
        subjects={subjects}
        locations={locations}
        colorGroups={colorGroups}
        absenceCap={absenceCap}
      />
    </>
  );
};

export default SystemOptionsModal;
