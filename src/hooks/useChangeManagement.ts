import { useState, useCallback, useEffect } from 'react';
import { SubjectAPI, Location } from '@utils/types';
import { Change } from '../components/SystemChangesConfirmationDialog';

/**
 * This hook manages pending changes to system entities (subjects, locations) and settings.
 * It tracks changes in local state until they are confirmed and applied to the backend.
 *
 * Key features:
 * - Tracks additions, updates, deletions, and archive/unarchive operations
 * - Handles conflict resolution when multiple changes affect the same entity
 * - Provides preview of changes through updated entity lists
 * - Applies changes to the backend when confirmed
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

  /**
   * Captures original values before an update to support change reversal
   */
  const captureOriginalValues = (
    change: Change,
    entityList: any[]
  ): Record<string, any> => {
    if (change.type !== 'update') return {};

    const entity = entityList.find((e) => e.id === change.id);
    if (!entity) return {};

    const originalValues: Record<string, any> = {};

    if (change.data?.abbreviation !== undefined) {
      originalValues.originalAbbreviation = entity.abbreviation;
    }

    if (change.data?.name !== undefined) {
      originalValues.originalName = entity.name;
    }

    if (
      change.data?.colorGroupId !== undefined &&
      change.entity === 'subject'
    ) {
      originalValues.originalColorGroupId = (entity as SubjectAPI).colorGroupId;
    }

    return originalValues;
  };

  /**
   * Merges an update change with an existing add change
   */
  const mergeUpdateIntoAdd = (
    existingChanges: Change[],
    change: Change,
    addChangesForSameEntityType: Change[]
  ) => {
    // Find the newly added entity with the same ID
    const matchingAddChange = addChangesForSameEntityType.find(
      (c) =>
        (change.id && change.id < 0 && c.id === change.id) ||
        (c.id === undefined && change.id === undefined)
    );

    if (!matchingAddChange) return null;

    return existingChanges.map((c) => {
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
          id: change.id || c.id,
          displayText: `Added ${change.entity === 'subject' ? 'Subject' : 'Location'} "${mergedData.name}"`,
        };
      }
      return c;
    });
  };

  /**
   * Merges multiple update changes on the same entity
   */
  const mergeUpdateChanges = (
    existingChanges: Change[],
    change: Change,
    existingUpdate: Change
  ) => {
    // Merge this update with the existing update, but preserve original values
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
        allChangesReverted && mergedData.abbreviation === originalAbbreviation;
    }

    // If colorGroupId was changed (only applies to subjects)
    if (change.entity === 'subject' && mergedData.colorGroupId !== undefined) {
      allChangesReverted =
        allChangesReverted && mergedData.colorGroupId === originalColorGroupId;
    }

    // If all changes have been reverted, remove this change entirely
    if (allChangesReverted) {
      return existingChanges.filter((c) => c !== existingUpdate);
    }

    // Otherwise, merge the changes
    return existingChanges.map((c) => {
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
        if (change.entity === 'subject' && c.data?.originalColorGroupId) {
          preservedOriginalValues.originalColorGroupId =
            c.data.originalColorGroupId;
        }

        // Only use new original values if the existing update doesn't have them
        if (!c.data?.originalName && change.data?.originalName) {
          preservedOriginalValues.originalName = change.data.originalName;
        }
        if (
          !c.data?.originalAbbreviation &&
          change.data?.originalAbbreviation
        ) {
          preservedOriginalValues.originalAbbreviation =
            change.data.originalAbbreviation;
        }
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
            ...c.data,
            ...change.data,
            ...preservedOriginalValues,
          },
          displayText: c.displayText,
        };
      }
      return c;
    });
  };

  /**
   * Handles add/delete conflict for newly added entities
   */
  const handleAddDeleteConflict = (change: Change) => {
    // For newly added and then deleted entities, remove from UI immediately
    if (change.entity === 'subject') {
      setSubjects((prevSubjects) =>
        prevSubjects.filter((subject) => subject.id !== change.id)
      );
    } else if (change.entity === 'location') {
      setLocations((prevLocations) =>
        prevLocations.filter((location) => location.id !== change.id)
      );
    }

    // Remove all changes for this entity
    return true;
  };

  const handleAddChange = useCallback(
    (change: Change) => {
      // Capture original values for update operations
      if (change.type === 'update') {
        const entityList = change.entity === 'subject' ? subjects : locations;
        const originalValues = captureOriginalValues(change, entityList);

        // Add original values to the change data
        change = {
          ...change,
          data: {
            ...change.data,
            ...originalValues,
          },
        };
      }

      setPendingChanges((prevChanges) => {
        // Create a unique key to track changes by entity type and ID
        const changeKey = `${change.entity}-${change.id || 'new'}`;

        // Check for newly added entities being updated
        const addChangesForSameEntityType = prevChanges.filter(
          (c) => c.type === 'add' && c.entity === change.entity
        );

        // Group existing changes by entity for easier processing
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
          if (handleAddDeleteConflict(change)) {
            return prevChanges.filter(
              (c) => !(c.entity === change.entity && c.id === change.id)
            );
          }
        }

        // Case 2: Entity is changed and then deleted - keep only the delete
        if (change.type === 'delete') {
          return [
            ...prevChanges.filter(
              (c) => !(c.entity === change.entity && c.id === change.id)
            ),
            change,
          ];
        }

        // Case 3: For update changes on newly added entities, merge with add operation
        if (
          change.type === 'update' &&
          addChangesForSameEntityType.length > 0
        ) {
          const mergedChanges = mergeUpdateIntoAdd(
            prevChanges,
            change,
            addChangesForSameEntityType
          );

          if (mergedChanges) {
            return mergedChanges;
          }
        }

        // Case 4: Entity is updated multiple times - merge the update operations
        if (change.type === 'update') {
          const existingUpdate = existingChanges.find(
            (c) => c.type === 'update'
          );

          if (existingUpdate) {
            return mergeUpdateChanges(prevChanges, change, existingUpdate);
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

  /**
   * Applies entity-specific changes to the given entity list
   */
  const processEntityChanges = <T extends { id: number }>(
    entities: T[],
    changes: Change[],
    isSubject: boolean
  ): T[] => {
    if (changes.length === 0) return entities;

    let updatedEntities = [...entities];

    changes.forEach((change) => {
      switch (change.type) {
        case 'add':
          // Create new entity with provided data
          const newEntity = {
            id: change.id || -Date.now(),
            name: change.data.name,
            abbreviation: change.data.abbreviation,
            ...(isSubject && {
              colorGroupId: change.data.colorGroupId,
              colorGroup: colorGroups.find(
                (cg) => cg.id === change.data.colorGroupId
              ) || {
                name: 'Default',
                colorCodes: ['#000000', '#000000', '#000000'],
              },
            }),
            archived: false,
          } as unknown as T;

          // Add entity if not already present
          const existingIndex = updatedEntities.findIndex(
            (e) => e.id === newEntity.id
          );
          if (existingIndex === -1) {
            updatedEntities.push(newEntity);
          }
          break;

        case 'update':
          // Update entity properties
          updatedEntities = updatedEntities.map((entity) =>
            entity.id === change.id
              ? {
                  ...entity,
                  ...(change.data.name && { name: change.data.name }),
                  ...(change.data.abbreviation && {
                    abbreviation: change.data.abbreviation,
                  }),
                  ...(isSubject &&
                    change.data.colorGroupId && {
                      colorGroupId: change.data.colorGroupId,
                      colorGroup:
                        colorGroups.find(
                          (cg) => cg.id === change.data.colorGroupId
                        ) || (entity as any).colorGroup,
                    }),
                }
              : entity
          );
          break;

        case 'delete':
          // Remove entity
          updatedEntities = updatedEntities.filter(
            (entity) => entity.id !== change.id
          );
          break;

        case 'archive':
        case 'unarchive':
          // Change archived status
          updatedEntities = updatedEntities.map((entity) =>
            entity.id === change.id
              ? { ...entity, archived: change.data.archived }
              : entity
          );
          break;
      }
    });

    return updatedEntities;
  };

  // Update local state based on pending changes
  useEffect(() => {
    // Process subject changes
    const subjectChanges = pendingChanges.filter(
      (change) => change.entity === 'subject'
    );

    if (subjectChanges.length > 0) {
      const updatedSubjects = processEntityChanges(
        subjects,
        subjectChanges,
        true
      );
      if (JSON.stringify(updatedSubjects) !== JSON.stringify(subjects)) {
        setSubjects(updatedSubjects);
      }
    }

    // Process location changes
    const locationChanges = pendingChanges.filter(
      (change) => change.entity === 'location'
    );

    if (locationChanges.length > 0) {
      const updatedLocations = processEntityChanges(
        locations,
        locationChanges,
        false
      );
      if (JSON.stringify(updatedLocations) !== JSON.stringify(locations)) {
        setLocations(updatedLocations);
      }
    }

    // Process settings changes
    const settingChanges = pendingChanges.filter(
      (change) => change.entity === 'setting'
    );

    if (settingChanges.length > 0) {
      // Find the most recent absenceCap change
      const absenceCapChange = settingChanges
        .filter((change) => change.data?.absenceCap !== undefined)
        .pop();

      if (absenceCapChange && absenceCapChange.data?.absenceCap !== undefined) {
        setAbsenceCap(absenceCapChange.data.absenceCap);
      }
    }
  }, [pendingChanges, subjects, locations, colorGroups]);

  /**
   * Applies all pending changes to the backend via API calls
   */
  const applyChanges = async (): Promise<boolean> => {
    if (pendingChanges.length === 0) return true;

    const results: { success: boolean; message: string }[] = [];
    let hasErrors = false;

    for (const change of pendingChanges) {
      try {
        // Configure API request based on entity and change type
        let endpoint = '';
        let method = '';
        let body = null;

        // Determine API endpoint
        switch (change.entity) {
          case 'subject':
            endpoint =
              change.type === 'add'
                ? '/api/subjects'
                : `/api/subjects/${change.id}`;
            break;
          case 'location':
            endpoint =
              change.type === 'add'
                ? '/api/locations'
                : `/api/locations/${change.id}`;
            break;
          case 'setting':
            endpoint = '/api/settings';
            break;
        }

        // Determine request method and body
        switch (change.type) {
          case 'add':
            method = 'POST';
            body = change.data;
            break;
          case 'delete':
            method = 'DELETE';
            break;
          case 'update':
          case 'archive':
          case 'unarchive':
            method = 'PATCH';
            body = change.data;
            break;
        }

        // Make the API call
        if (endpoint) {
          const options: RequestInit = {
            method,
          };

          if (body) {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(body);
          }

          await fetch(endpoint, options);
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

    // Show status notification
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

  /**
   * Clears all pending changes and resets to initial state
   */
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
