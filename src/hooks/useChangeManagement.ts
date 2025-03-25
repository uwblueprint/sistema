import { useState, useCallback, useEffect } from 'react';
import { SubjectAPI, Location } from '@utils/types';

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
  colorGroups: { id: number; name: string; colorCodes: string[] }[];
  absenceCap: number;
  onRefresh?: () => void;
  toast?: any;
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
  colorGroups,
  absenceCap: initialAbsenceCap,
  onRefresh,
  toast,
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
          newMap.set(subjectId, { ...subject, id: subjectId });
        } else if (subject === null && id !== undefined) {
          // Delete case: set to null to mark for deletion
          newMap.set(id, null);
        }
        return newMap;
      });
    },
    [generateTempId]
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
          newMap.set(locationId, { ...location, id: locationId });
        } else if (location === null && id !== undefined) {
          // Delete case: set to null to mark for deletion
          newMap.set(id, null);
        }
        return newMap;
      });
    },
    [generateTempId]
  );

  /**
   * Handle updates to absence cap setting
   */
  const handleUpdateAbsenceCap = useCallback((newAbsenceCap: number) => {
    setPendingSettings((prev) => ({
      ...prev,
      absenceCap: newAbsenceCap,
    }));
  }, []);

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
   * Applies all pending changes to the backend via API calls
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
      // Process subject changes
      for (const [id, subject] of Array.from(pendingSubjects.entries())) {
        if (subject === null) {
          // Handle deletion
          const response = await fetch(`/api/subjects/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            success = false;
            errorMessage = 'Failed to delete subject';
            console.error(`${errorMessage}: ${await response.text()}`);
            break;
          }
        } else if (id < 0) {
          // Handle new subject (post)
          const newSubject = {
            name: subject.name,
            abbreviation: subject.abbreviation,
            colorGroupId: subject.colorGroupId,
          };
          const response = await fetch('/api/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSubject),
          });
          if (!response.ok) {
            success = false;
            try {
              const errorData = await response.json();
              errorMessage = `Failed to create subject: ${errorData.error || 'Unknown error'}`;
            } catch {
              errorMessage = 'Failed to create subject';
            }
            console.error(errorMessage);
            break;
          }
        } else {
          // Handle update (patch)
          const originalSubject = initialSubjects.find((s) => s.id === id);
          if (!originalSubject) continue;

          const updates: any = {};
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

          // Only send request if there are actual changes
          if (Object.keys(updates).length > 0) {
            const response = await fetch(`/api/subjects/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            });
            if (!response.ok) {
              success = false;
              try {
                const errorData = await response.json();
                errorMessage = `Failed to update subject: ${errorData.error || 'Unknown error'}`;
              } catch {
                errorMessage = 'Failed to update subject';
              }
              console.error(errorMessage);
              break;
            }
          }
        }
      }

      // Only proceed with location changes if subject changes were successful
      if (success) {
        // Process location changes
        for (const [id, location] of Array.from(pendingLocations.entries())) {
          if (location === null) {
            // Handle deletion
            const response = await fetch(`/api/locations/${id}`, {
              method: 'DELETE',
            });
            if (!response.ok) {
              success = false;
              errorMessage = 'Failed to delete location';
              console.error(`${errorMessage}: ${await response.text()}`);
              break;
            }
          } else if (id < 0) {
            // Handle new location (post)
            const newLocation = {
              name: location.name,
              abbreviation: location.abbreviation,
            };
            const response = await fetch('/api/locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newLocation),
            });
            if (!response.ok) {
              success = false;
              try {
                const errorData = await response.json();
                errorMessage = `Failed to create location: ${errorData.error || 'Unknown error'}`;
              } catch {
                errorMessage = 'Failed to create location';
              }
              console.error(errorMessage);
              break;
            }
          } else {
            // Handle update (patch)
            const originalLocation = initialLocations.find((l) => l.id === id);
            if (!originalLocation) continue;

            const updates: any = {};
            if (location.name !== originalLocation.name) {
              updates.name = location.name;
            }
            if (location.abbreviation !== originalLocation.abbreviation) {
              updates.abbreviation = location.abbreviation;
            }
            if (location.archived !== originalLocation.archived) {
              updates.archived = location.archived;
            }

            // Only send request if there are actual changes
            if (Object.keys(updates).length > 0) {
              const response = await fetch(`/api/locations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
              });
              if (!response.ok) {
                success = false;
                try {
                  const errorData = await response.json();
                  errorMessage = `Failed to update location: ${errorData.error || 'Unknown error'}`;
                } catch {
                  errorMessage = 'Failed to update location';
                }
                console.error(errorMessage);
                break;
              }
            }
          }
        }
      }

      // Only proceed with settings changes if other changes were successful
      if (
        success &&
        pendingSettings.absenceCap !== undefined &&
        pendingSettings.absenceCap !== initialAbsenceCap
      ) {
        const response = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ absenceCap: pendingSettings.absenceCap }),
        });
        if (!response.ok) {
          success = false;
          try {
            const errorData = await response.json();
            errorMessage = `Failed to update settings: ${errorData.error || 'Unknown error'}`;
          } catch {
            errorMessage = 'Failed to update settings';
          }
          console.error(errorMessage);
        }
      }

      if (success) {
        // Refresh data after all changes have been applied
        if (onRefresh) {
          onRefresh();
        }

        // Show success toast
        if (toast) {
          toast({
            title: 'Changes saved',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }

        // Clear pending changes after successful application
        clearChanges();
      } else {
        // Show error toast
        if (toast) {
          toast({
            title: 'Error',
            description: errorMessage || 'Failed to save changes',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Error applying changes:', error);
      success = false;

      // Show error toast
      if (toast) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to save changes',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
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
