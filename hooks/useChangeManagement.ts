import { Location, SubjectAPI } from '@utils/types';
import { useCallback, useEffect, useState } from 'react';

/**
 * This hook manages pending changes to system entities using an entity-based tracking approach.
 * Instead of tracking individual atomic changes, it stores the final state of each modified entity.
 *
 * Key features:
 * - Stores maps of entities (by ID) for subjects, locations, and settings
 * - Uses negative IDs for new entities
 * - Represents deleted entities with null values
 * - Simple update process: just update the entity in the appropriate map
 * - Generates change display information by comparing original and current entities
 */

interface UseChangeManagementProps {
  subjects: SubjectAPI[];
  locations: Location[];
  absenceCap: number;
  onRefresh?: () => void;
  showToast?: any;
}

interface UseChangeManagementReturn {
  pendingEntities: {
    subjects: Map<number, SubjectAPI | null>;
    locations: Map<number, Location | null>;
    settings: { absenceCap?: number };
  };
  handleUpdateSubject: (subject: SubjectAPI | null, id?: number) => void;
  handleUpdateLocation: (location: Location | null, id?: number) => void;
  handleUpdateAbsenceCap: (absenceCap: number) => void;
  applyChanges: () => Promise<boolean>;
  clearChanges: () => void;
  updatedSubjects: SubjectAPI[];
  updatedLocations: Location[];
  updatedAbsenceCap: number;
}

export const useChangeManagement = ({
  subjects: initialSubjects,
  locations: initialLocations,
  absenceCap: initialAbsenceCap,
  onRefresh,
  showToast,
}: UseChangeManagementProps): UseChangeManagementReturn => {
  // Store maps of pending entity changes
  const [pendingSubjects, setPendingSubjects] = useState<
    Map<number, SubjectAPI | null>
  >(new Map());
  const [pendingLocations, setPendingLocations] = useState<
    Map<number, Location | null>
  >(new Map());
  const [pendingSettings, setPendingSettings] = useState<{
    absenceCap?: number;
  }>({});

  // Store local computed versions of entities with changes applied
  const [updatedSubjectsList, setUpdatedSubjectsList] = useState<SubjectAPI[]>([
    ...initialSubjects,
  ]);
  const [updatedLocationsList, setUpdatedLocationsList] = useState<Location[]>([
    ...initialLocations,
  ]);
  const [updatedAbsenceCap, setUpdatedAbsenceCap] =
    useState<number>(initialAbsenceCap);

  // Generate a unique negative ID for new entities
  const generateTempId = useCallback(() => {
    return -Date.now();
  }, []);

  // Reset local state when props change (e.g. after a refresh)
  useEffect(() => {
    setUpdatedSubjectsList([...initialSubjects]);
    setUpdatedLocationsList([...initialLocations]);
    setUpdatedAbsenceCap(initialAbsenceCap);
    // Don't reset the pending changes here to preserve during refresh
  }, [initialSubjects, initialLocations, initialAbsenceCap]);

  /**
   * Handle updates to a subject
   * @param subject The updated subject or null if deleted
   */
  const handleUpdateSubject = useCallback(
    (subject: SubjectAPI | null, id?: number) => {
      setPendingSubjects((prev) => {
        const newMap = new Map(prev);
        if (subject) {
          // If this is a new subject without an ID, generate a temporary negative ID
          const subjectId = subject.id || generateTempId();

          // Check if the subject is being reverted to its original state
          if (subjectId > 0) {
            // Only check for existing subjects (positive IDs)
            const originalSubject = initialSubjects.find(
              (s) => s.id === subjectId
            );
            if (
              originalSubject &&
              originalSubject.name === subject.name &&
              originalSubject.abbreviation === subject.abbreviation &&
              originalSubject.colorGroupId === subject.colorGroupId &&
              originalSubject.archived === subject.archived
            ) {
              // If equal to original, remove from pending changes instead of adding
              newMap.delete(subjectId);
              return newMap;
            }
          }

          newMap.set(subjectId, { ...subject, id: subjectId });
        } else if (subject === null && id !== undefined) {
          // Delete case
          if (id < 0) {
            // If deleting a newly added entity (negative ID), remove it from pending changes completely
            newMap.delete(id);
          } else {
            // If deleting an existing entity (positive ID), mark for deletion
            newMap.set(id, null);
          }
        }
        return newMap;
      });
    },
    [generateTempId, initialSubjects]
  );

  /**
   * Handle updates to a location
   * @param location The updated location or null if deleted
   */
  const handleUpdateLocation = useCallback(
    (location: Location | null, id?: number) => {
      setPendingLocations((prev) => {
        const newMap = new Map(prev);
        if (location) {
          // If this is a new location without an ID, generate a temporary negative ID
          const locationId = location.id || generateTempId();

          // Check if the location is being reverted to its original state
          if (locationId > 0) {
            // Only check for existing locations (positive IDs)
            const originalLocation = initialLocations.find(
              (l) => l.id === locationId
            );
            if (
              originalLocation &&
              originalLocation.name === location.name &&
              originalLocation.abbreviation === location.abbreviation &&
              originalLocation.archived === location.archived
            ) {
              // If equal to original, remove from pending changes instead of adding
              newMap.delete(locationId);
              return newMap;
            }
          }

          newMap.set(locationId, { ...location, id: locationId });
        } else if (location === null && id !== undefined) {
          // Delete case
          if (id < 0) {
            // If deleting a newly added entity (negative ID), remove it from pending changes completely
            newMap.delete(id);
          } else {
            // If deleting an existing entity (positive ID), mark for deletion
            newMap.set(id, null);
          }
        }
        return newMap;
      });
    },
    [generateTempId, initialLocations]
  );

  /**
   * Handle updates to absence cap setting
   */
  const handleUpdateAbsenceCap = useCallback(
    (newAbsenceCap: number) => {
      setPendingSettings((prev) => {
        // If new absence cap equals original, remove it from pending settings
        if (newAbsenceCap === initialAbsenceCap) {
          const { ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          absenceCap: newAbsenceCap,
        };
      });
    },
    [initialAbsenceCap]
  );

  // Update local state based on pending entity changes
  useEffect(() => {
    // Process subject changes
    const newSubjectsList = [...initialSubjects];

    // Add/update pending subjects
    pendingSubjects.forEach((pendingSubject, id) => {
      if (pendingSubject === null) {
        // Remove deleted subjects
        const index = newSubjectsList.findIndex((s) => s.id === id);
        if (index !== -1) {
          newSubjectsList.splice(index, 1);
        }
      } else if (id < 0) {
        // Add new subjects with negative IDs
        newSubjectsList.push(pendingSubject);
      } else {
        // Update existing subjects
        const index = newSubjectsList.findIndex((s) => s.id === id);
        if (index !== -1) {
          newSubjectsList[index] = pendingSubject;
        }
      }
    });

    setUpdatedSubjectsList(newSubjectsList);

    // Process location changes
    const newLocationsList = [...initialLocations];

    // Add/update pending locations
    pendingLocations.forEach((pendingLocation, id) => {
      if (pendingLocation === null) {
        // Remove deleted locations
        const index = newLocationsList.findIndex((l) => l.id === id);
        if (index !== -1) {
          newLocationsList.splice(index, 1);
        }
      } else if (id < 0) {
        // Add new locations with negative IDs
        newLocationsList.push(pendingLocation);
      } else {
        // Update existing locations
        const index = newLocationsList.findIndex((l) => l.id === id);
        if (index !== -1) {
          newLocationsList[index] = pendingLocation;
        }
      }
    });

    setUpdatedLocationsList(newLocationsList);

    // Process settings changes
    if (pendingSettings.absenceCap !== undefined) {
      setUpdatedAbsenceCap(pendingSettings.absenceCap);
    }
  }, [
    pendingSubjects,
    pendingLocations,
    pendingSettings,
    initialSubjects,
    initialLocations,
  ]);

  /**
   * Applies all pending changes to the backend via a single API call
   * Implements an "all or nothing" approach where either all changes are applied
   * or none are (transaction-like behavior)
   */
  const applyChanges = async (): Promise<boolean> => {
    let hasChanges =
      pendingSubjects.size > 0 ||
      pendingLocations.size > 0 ||
      Object.keys(pendingSettings).length > 0;
    if (!hasChanges) return true;

    let success = true;
    let errorMessage = '';

    try {
      // Prepare subject changes
      const subjectChanges = {
        create: [] as Partial<SubjectAPI>[],
        update: [] as { id: number; changes: Partial<SubjectAPI> }[],
        delete: [] as number[],
      };

      // Process subject changes
      for (const [id, subject] of Array.from(pendingSubjects.entries())) {
        if (subject === null) {
          // Handle deletion
          subjectChanges.delete.push(id);
        } else if (id < 0) {
          // Handle new subject
          subjectChanges.create.push({
            name: subject.name,
            abbreviation: subject.abbreviation,
            colorGroupId: subject.colorGroupId,
          });
        } else {
          // Handle update
          const originalSubject = initialSubjects.find((s) => s.id === id);
          if (!originalSubject) continue;

          const updates: Partial<SubjectAPI> = {};
          if (subject.name !== originalSubject.name) {
            updates.name = subject.name;
          }
          if (subject.abbreviation !== originalSubject.abbreviation) {
            updates.abbreviation = subject.abbreviation;
          }
          if (subject.archived !== originalSubject.archived) {
            updates.archived = subject.archived;
          }
          if (subject.colorGroupId !== originalSubject.colorGroupId) {
            updates.colorGroupId = subject.colorGroupId;
          }

          // Only include if there are actual changes
          if (Object.keys(updates).length > 0) {
            subjectChanges.update.push({ id, changes: updates });
          }
        }
      }

      // Prepare location changes
      const locationChanges = {
        create: [] as Partial<Location>[],
        update: [] as { id: number; changes: Partial<Location> }[],
        delete: [] as number[],
      };

      // Process location changes
      for (const [id, location] of Array.from(pendingLocations.entries())) {
        if (location === null) {
          // Handle deletion
          locationChanges.delete.push(id);
        } else if (id < 0) {
          // Handle new location
          locationChanges.create.push({
            name: location.name,
            abbreviation: location.abbreviation,
          });
        } else {
          // Handle update
          const originalLocation = initialLocations.find((l) => l.id === id);
          if (!originalLocation) continue;

          const updates: Partial<Location> = {};
          if (location.name !== originalLocation.name) {
            updates.name = location.name;
          }
          if (location.abbreviation !== originalLocation.abbreviation) {
            updates.abbreviation = location.abbreviation;
          }
          if (location.archived !== originalLocation.archived) {
            updates.archived = location.archived;
          }

          // Only include if there are actual changes
          if (Object.keys(updates).length > 0) {
            locationChanges.update.push({ id, changes: updates });
          }
        }
      }

      // Prepare settings changes
      const settingsChanges = {
        absenceCap:
          pendingSettings.absenceCap !== undefined &&
          pendingSettings.absenceCap !== initialAbsenceCap
            ? pendingSettings.absenceCap
            : undefined,
      };

      // Send all changes in a single transaction-like request
      const response = await fetch('/api/system/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjectChanges,
          locations: locationChanges,
          settings: settingsChanges,
        }),
      });

      if (!response.ok) {
        success = false;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Failed to save changes';
        } catch {
          errorMessage = 'Failed to save changes';
        }
        console.error('Error applying changes:', errorMessage);
      } else {
        // Refresh data after all changes have been applied
        if (onRefresh) {
          onRefresh();
        }

        // Show success toast
        if (showToast) {
          showToast({
            title: 'Changes saved',
            status: 'success',
            duration: 3000,
          });
        }

        // Clear pending changes after successful application
        clearChanges();
      }
    } catch (error) {
      console.error('Error applying changes:', error);
      success = false;
      errorMessage =
        error instanceof Error ? error.message : 'Failed to save changes';
    }

    // Show error toast if there was a problem
    if (!success && showToast) {
      showToast({
        title: 'Error',
        description: errorMessage || 'Failed to save changes',
        status: 'error',
      });
    }

    return success;
  };

  /**
   * Clears all pending changes
   */
  const clearChanges = useCallback(() => {
    setPendingSubjects(new Map());
    setPendingLocations(new Map());
    setPendingSettings({});
  }, []);

  // Bundle all pending entity maps for easier access
  const pendingEntities = {
    subjects: pendingSubjects,
    locations: pendingLocations,
    settings: pendingSettings,
  };

  return {
    pendingEntities,
    handleUpdateSubject,
    handleUpdateLocation,
    handleUpdateAbsenceCap,
    applyChanges,
    clearChanges,
    updatedSubjects: updatedSubjectsList,
    updatedLocations: updatedLocationsList,
    updatedAbsenceCap,
  };
};
