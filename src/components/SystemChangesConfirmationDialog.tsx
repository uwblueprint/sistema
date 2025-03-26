import {
  Button,
  Text,
  VStack,
  Box,
  HStack,
  Icon,
  Flex,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Center,
} from '@chakra-ui/react';
import React from 'react';
import { FiTrash2, FiArchive, FiFolder, FiEdit2 } from 'react-icons/fi';
import { IoWarning, IoAlertCircleSharp, IoAdd } from 'react-icons/io5';
import { SubjectAPI, Location } from '@utils/types';

// Entity-based pending changes structure
export interface PendingEntities {
  subjects: Map<number, SubjectAPI | null>;
  locations: Map<number, Location | null>;
  settings: { absenceCap?: number };
}

interface SystemChangesConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingEntities: PendingEntities;
  isConfirmingClose?: boolean;
  subjects: SubjectAPI[];
  locations: Location[];
  colorGroups: any[];
  absenceCap: number;
}

const SystemChangesConfirmationDialog: React.FC<
  SystemChangesConfirmationDialogProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingEntities,
  isConfirmingClose = false,
  subjects,
  locations,
  colorGroups,
  absenceCap,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Icons for different change types
  const getChangeIcon = (changeType: string) => {
    if (changeType === 'delete') {
      return <Icon as={FiTrash2} color="red.500" boxSize={5} />;
    } else if (changeType === 'archive' || changeType === 'unarchive') {
      return <Icon as={FiArchive} color="blue.500" boxSize={5} />;
    } else if (changeType === 'update') {
      return <Icon as={FiEdit2} color="blue.500" boxSize={5} />;
    } else if (changeType === 'add') {
      return <Icon as={IoAdd} color="blue.500" boxSize={8} />;
    }
    return null;
  };

  // Get display text for a change
  const getChangeText = (
    changeType: string,
    entityType: string
  ): { text: string; color: string } => {
    if (changeType === 'delete') {
      return {
        text: `Deleted ${entityType === 'subject' ? 'Subject' : 'Location'}`,
        color: 'red.500',
      };
    } else if (changeType === 'archive') {
      return {
        text: `Archived ${entityType === 'subject' ? 'Subject' : 'Location'}`,
        color: 'blue.500',
      };
    } else if (changeType === 'unarchive') {
      return {
        text: `Unarchived ${entityType === 'subject' ? 'Subject' : 'Location'}`,
        color: 'blue.500',
      };
    } else if (changeType === 'add') {
      return {
        text: `Added ${entityType === 'subject' ? 'Subject' : 'Location'}`,
        color: 'blue.500',
      };
    }
    return { text: `Updated ${entityType}`, color: 'gray.700' };
  };

  // Convert pending entities to displayable changes
  const getDisplayableChanges = (): {
    icon: React.ReactNode;
    label: string;
    color: string;
    details: React.ReactNode;
  }[] => {
    const displayChanges: {
      icon: React.ReactNode;
      label: string;
      color: string;
      details: React.ReactNode;
    }[] = [];

    // Check if there are any pending changes
    const hasSubjectChanges = pendingEntities.subjects.size > 0;
    const hasLocationChanges = pendingEntities.locations.size > 0;
    const hasSettingChanges = pendingEntities.settings.absenceCap !== undefined;

    if (!hasSubjectChanges && !hasLocationChanges && !hasSettingChanges) {
      return [
        {
          icon: null,
          label: 'No changes to apply',
          color: 'gray.700',
          details: '',
        },
      ];
    }

    // Process subject changes
    pendingEntities.subjects.forEach((updatedSubject, id) => {
      if (updatedSubject === null) {
        // Handle deleted subject
        const originalSubject = subjects.find((s) => s.id === id);
        if (originalSubject) {
          displayChanges.push({
            icon: getChangeIcon('delete'),
            label: `Deleted Subject`,
            color: 'red.500',
            details: `"${originalSubject.name}"`,
          });
        }
      } else if (id < 0) {
        // Handle new subject
        displayChanges.push({
          icon: getChangeIcon('add'),
          label: `Added Subject`,
          color: 'blue.500',
          details: `"${updatedSubject.name}"`,
        });
      } else {
        // Handle updated subject
        const originalSubject = subjects.find((s) => s.id === id);
        if (!originalSubject) return;

        // Check for name changes
        if (originalSubject.name !== updatedSubject.name) {
          displayChanges.push({
            icon: getChangeIcon('update'),
            label: `Updated Subject Name`,
            color: 'blue.500',
            details: `"${originalSubject.name}" → "${updatedSubject.name}"`,
          });
        }

        // Check for abbreviation changes
        if (originalSubject.abbreviation !== updatedSubject.abbreviation) {
          let label = 'Updated Display';
          let details = `"${originalSubject.abbreviation}" → "${updatedSubject.abbreviation}"`;

          // Handle empty to value case: "Added Display"
          if (originalSubject.abbreviation === '') {
            label = 'Added Display';
            details = `"${updatedSubject.abbreviation}" to "${updatedSubject.name}"`;
          }
          // Handle value to empty case: "Removed Display"
          else if (updatedSubject.abbreviation === '') {
            label = 'Removed Display';
            details = `"${originalSubject.abbreviation}" from "${updatedSubject.name}"`;
          }

          displayChanges.push({
            icon: getChangeIcon('update'),
            label,
            color: 'blue.500',
            details,
          });
        }

        // Check for archived status changes
        if (originalSubject.archived !== updatedSubject.archived) {
          displayChanges.push({
            icon: getChangeIcon(
              updatedSubject.archived ? 'archive' : 'unarchive'
            ),
            label: updatedSubject.archived
              ? 'Archived Subject'
              : 'Unarchived Subject',
            color: 'blue.500',
            details: `"${updatedSubject.name}"`,
          });
        }

        // Check for color group changes
        if (originalSubject.colorGroupId !== updatedSubject.colorGroupId) {
          const originalColorGroup = colorGroups.find(
            (cg) => cg.id === originalSubject.colorGroupId
          );
          const newColorGroup = colorGroups.find(
            (cg) => cg.id === updatedSubject.colorGroupId
          );

          displayChanges.push({
            icon: getChangeIcon('update'),
            label: `Updated Subject Colour`,
            color: 'blue.500',
            details: (
              <HStack spacing={1}>
                <Text>{updatedSubject.name}:</Text>
                <Box
                  display="inline-block"
                  w="14px"
                  h="14px"
                  borderRadius="full"
                  bg={originalColorGroup?.colorCodes[1] || 'gray.300'}
                />
                <Text mx={1}>→</Text>
                <Box
                  display="inline-block"
                  w="14px"
                  h="14px"
                  borderRadius="full"
                  bg={newColorGroup?.colorCodes[1] || 'gray.300'}
                />
              </HStack>
            ),
          });
        }
      }
    });

    // Process location changes
    pendingEntities.locations.forEach((updatedLocation, id) => {
      if (updatedLocation === null) {
        // Handle deleted location
        const originalLocation = locations.find((l) => l.id === id);
        if (originalLocation) {
          displayChanges.push({
            icon: getChangeIcon('delete'),
            label: `Deleted Location`,
            color: 'red.500',
            details: `"${originalLocation.name}"`,
          });
        }
      } else if (id < 0) {
        // Handle new location
        displayChanges.push({
          icon: getChangeIcon('add'),
          label: `Added Location`,
          color: 'blue.500',
          details: `"${updatedLocation.name}"`,
        });
      } else {
        // Handle updated location
        const originalLocation = locations.find((l) => l.id === id);
        if (!originalLocation) return;

        // Check for name changes
        if (originalLocation.name !== updatedLocation.name) {
          displayChanges.push({
            icon: getChangeIcon('update'),
            label: `Updated Location Name`,
            color: 'blue.500',
            details: `"${originalLocation.name}" → "${updatedLocation.name}"`,
          });
        }

        // Check for abbreviation changes
        if (originalLocation.abbreviation !== updatedLocation.abbreviation) {
          let label = 'Updated Display';
          let details = `"${originalLocation.abbreviation}" → "${updatedLocation.abbreviation}"`;

          // Handle empty to value case: "Added Display"
          if (originalLocation.abbreviation === '') {
            label = 'Added Display';
            details = `"${updatedLocation.abbreviation}" to "${updatedLocation.name}"`;
          }
          // Handle value to empty case: "Removed Display"
          else if (updatedLocation.abbreviation === '') {
            label = 'Removed Display';
            details = `"${originalLocation.abbreviation}" from "${updatedLocation.name}"`;
          }

          displayChanges.push({
            icon: getChangeIcon('update'),
            label,
            color: 'blue.500',
            details,
          });
        }

        // Check for archived status changes
        if (originalLocation.archived !== updatedLocation.archived) {
          displayChanges.push({
            icon: getChangeIcon(
              updatedLocation.archived ? 'archive' : 'unarchive'
            ),
            label: updatedLocation.archived
              ? 'Archived Location'
              : 'Unarchived Location',
            color: 'blue.500',
            details: `"${updatedLocation.name}"`,
          });
        }
      }
    });

    // Process settings changes
    if (pendingEntities.settings.absenceCap !== undefined) {
      const newAbsenceCap = pendingEntities.settings.absenceCap;
      if (newAbsenceCap !== absenceCap) {
        displayChanges.push({
          icon: getChangeIcon('update'),
          label: `Updated Allowed Absences`,
          color: 'blue.500',
          details: `${absenceCap} → ${newAbsenceCap}`,
        });
      }
    }

    return displayChanges;
  };

  // Check if there are any delete operations
  const hasDeletedItems =
    Array.from(pendingEntities.subjects.values()).some((s) => s === null) ||
    Array.from(pendingEntities.locations.values()).some((l) => l === null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent p={8} width="sm">
          <AlertDialogHeader fontSize="lg" fontWeight="bold" py={4} px={0}>
            {isConfirmingClose ? (
              'Discard Changes?'
            ) : (
              <HStack spacing={2} justify="center" alignItems="flex-start">
                <Icon
                  as={IoAlertCircleSharp}
                  color="orange.400"
                  boxSize={6}
                  mt="2px"
                />
                <VStack spacing={0} align="start">
                  <Text>You are making the following changes.</Text>
                  <Text>Do you wish to proceed?</Text>
                </VStack>
              </HStack>
            )}
          </AlertDialogHeader>

          <AlertDialogBody pb={2} px={0}>
            {isConfirmingClose ? (
              <Text>
                You have unsaved changes. Are you sure you want to close without
                saving?
              </Text>
            ) : (
              <>
                <VStack
                  spacing={4}
                  align="stretch"
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  borderStyle="dotted"
                  mb={4}
                >
                  {getDisplayableChanges().map((change, index) => (
                    <HStack key={index} spacing={3} align="center">
                      <Box w="40px" textAlign="center">
                        {change.icon}
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color={change.color}>
                          {change.label}
                        </Text>
                        {typeof change.details === 'string' ? (
                          <Text fontSize="sm">{change.details}</Text>
                        ) : (
                          change.details
                        )}
                      </VStack>
                    </HStack>
                  ))}
                </VStack>

                {hasDeletedItems && (
                  <HStack
                    spacing={2}
                    color="red.500"
                    mb={2}
                    alignItems="center"
                  >
                    <Icon as={IoWarning} boxSize={5} />
                    <Text fontSize="sm">
                      Deleted subjects/locations cannot be restored.
                    </Text>
                  </HStack>
                )}
              </>
            )}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              flex="1"
              size="lg"
              colorScheme="blue"
              variant="outline"
              height="35px"
            >
              Back
            </Button>
            <Button
              colorScheme="blue"
              onClick={onConfirm}
              ml={3}
              flex="1"
              size="lg"
              height="35px"
            >
              Proceed
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default SystemChangesConfirmationDialog;
