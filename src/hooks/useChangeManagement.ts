import { useState, useCallback, useEffect } from 'react';
import { SubjectAPI, Location } from '@utils/types';
import { Change } from '../components/SystemChangesConfirmationDialog';

/**
 * This hook is used to manage pending changes to the system as they are applied in the System Options Modal.
 * It stores pending changes in the local state and applies them to the backend when the user confirms the changes.
 * It returns updated subjects, locations, and absence cap which are used to update the UI with the changed values.
 */

interface UseChangeManagementProps {
  subjects: SubjectAPI[];
  locations: Location[];
  colorGroups: { id: number; name: string; colorCodes: string[] }[];
  absenceCap: number;
  onRefresh?: () => void;
  toast?: any;
}

interface UseChangeManagementReturn {
  pendingChanges: Change[];
  handleAddChange: (change: Change) => void;
  applyChanges: () => Promise<boolean>;
  clearChanges: () => void;
  updatedSubjects: SubjectAPI[];
  updatedLocations: Location[];
  updatedAbsenceCap: number;
}

export const useChangeManagement = ({
  subjects: initialSubjects,
  locations: initialLocations,
  colorGroups,
  absenceCap: initialAbsenceCap,
  onRefresh,
  toast,
}: UseChangeManagementProps): UseChangeManagementReturn => {
  const [pendingChanges, setPendingChanges] = useState<Change[]>([]);
  const [subjects, setSubjects] = useState<SubjectAPI[]>([...initialSubjects]);
  const [locations, setLocations] = useState<Location[]>([...initialLocations]);
  const [absenceCap, setAbsenceCap] = useState<number>(initialAbsenceCap);

  // Reset local state when props change (e.g. after a refresh)
  useEffect(() => {
    setSubjects([...initialSubjects]);
    setLocations([...initialLocations]);
    setAbsenceCap(initialAbsenceCap);
  }, [initialSubjects, initialLocations, initialAbsenceCap]);

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
          // For newly added and then deleted entities, we need to ensure they're removed from the UI
          // Add a special flag to immediately remove from state
          if (change.entity === 'subject') {
            // Immediately update subjects state to remove this entity
            setSubjects((prevSubjects) =>
              prevSubjects.filter((subject) => subject.id !== change.id)
            );
          } else if (change.entity === 'location') {
            // Immediately update locations state to remove this entity
            setLocations((prevLocations) =>
              prevLocations.filter((location) => location.id !== change.id)
            );
          }

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

  // Update local state based on pending changes
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

            // Check if this subject already exists in our list
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

            // Check if this location already exists in our list
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
          setAbsenceCap(absenceCapChange.data.absenceCap);
        }
      }
    };

    handleSubjectChanges();
    handleLocationChanges();
    handleSettingChanges();
  }, [pendingChanges, subjects, locations, colorGroups]);

  // Apply changes to backend
  const applyChanges = async (): Promise<boolean> => {
    if (pendingChanges.length === 0) return true;

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

    // Show toast notifications if the toast function was provided
    if (toast) {
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
    }

    // Refresh data if callback was provided
    if (onRefresh) {
      onRefresh();
    }

    // Clear changes on success
    if (!hasErrors) {
      setPendingChanges([]);
    }

    return !hasErrors;
  };

  const clearChanges = () => {
    setPendingChanges([]);
    // Reset local state to original values
    setSubjects([...initialSubjects]);
    setLocations([...initialLocations]);
    setAbsenceCap(initialAbsenceCap);
  };

  return {
    pendingChanges,
    handleAddChange,
    applyChanges,
    clearChanges,
    updatedSubjects: subjects,
    updatedLocations: locations,
    updatedAbsenceCap: absenceCap,
  };
};
