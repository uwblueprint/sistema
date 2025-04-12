import {
  Box,
  Button,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Location, SubjectAPI } from '@utils/types';
import React from 'react';
import { FiArchive, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IoAdd, IoAlertCircleSharp, IoWarning } from 'react-icons/io5';

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
  subjects,
  locations,
  colorGroups,
  absenceCap,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Icons for different change types
  const getChangeIcon = (changeType: string) => {
    if (changeType === 'delete') {
      return <Icon as={FiTrash2} color="red.500" boxSize="21px" />;
    } else if (changeType === 'archive' || changeType === 'unarchive') {
      return <Icon as={FiArchive} color="blue.500" boxSize="21px" />;
    } else if (changeType === 'update') {
      return <Icon as={FiEdit2} color="blue.500" boxSize="21px" />;
    } else if (changeType === 'add') {
      return <Icon as={IoAdd} color="blue.500" boxSize="21px" />;
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

    // Log the pending entity counts for debugging
    console.log('Pending changes count:', {
      subjects: pendingEntities.subjects.size,
      locations: pendingEntities.locations.size,
      hasSettingChanges,
    });

    if (!hasSubjectChanges && !hasLocationChanges && !hasSettingChanges) {
      console.log('No changes to apply - returning empty state');
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
              <Text textStyle="caption" mt="2px">
                {updatedSubject.name}:{' '}
                <Box as="span" display="inline-block" whiteSpace="nowrap">
                  <Box
                    as="span"
                    display="inline-block"
                    w="1em"
                    h="1em"
                    borderRadius="full"
                    bg={originalColorGroup?.colorCodes[1] || 'gray.300'}
                    verticalAlign="middle"
                    mx="1px"
                  />{' '}
                  →{' '}
                  <Box
                    as="span"
                    display="inline-block"
                    w="1em"
                    h="1em"
                    borderRadius="full"
                    bg={newColorGroup?.colorCodes[1] || 'gray.300'}
                    verticalAlign="middle"
                    mx="1px"
                  />
                </Box>
              </Text>
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      motionPreset="scale"
      closeOnOverlayClick={false}
      preserveScrollBarGap
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
      <ModalContent
        p={8}
        width="sm"
        maxHeight="80vh"
        boxShadow="2xl"
        zIndex={1500}
      >
        <ModalHeader fontSize="lg" fontWeight="bold" pb={4} pt={0} px={0}>
          <Box>
            <HStack spacing={2} alignItems="center" mb={1}>
              <Icon as={IoAlertCircleSharp} color="orange.400" boxSize={6} />
              <Text textStyle="h4" fontWeight="500">
                You are making the following changes.
              </Text>
            </HStack>
            <Text textStyle="h3" fontWeight="600" ml="32px">
              Do you wish to proceed?
            </Text>
          </Box>
        </ModalHeader>

        <ModalBody pb={2} px={0}>
          <VStack
            spacing={3}
            align="stretch"
            p={4}
            borderWidth="1px"
            borderRadius="5px"
            borderColor="neutralGray.300"
            mb={4}
            maxH="236px"
            overflowY="auto"
          >
            {getDisplayableChanges().map((change, index) => (
              <HStack key={index} spacing={3} align="center">
                <Box minW="40px" textAlign="center">
                  {change.icon}
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={change.color} textStyle="h4">
                    {change.label}
                  </Text>
                  {typeof change.details === 'string' ? (
                    <Text textStyle="caption">{change.details}</Text>
                  ) : (
                    change.details
                  )}
                </VStack>
              </HStack>
            ))}
          </VStack>

          {hasDeletedItems && (
            <HStack spacing={3} color="errorRed.200" mb={2} alignItems="center">
              <Icon as={IoWarning} boxSize={5} />
              <Text
                textStyle="subtitle"
                fontWeight="600"
                textColor="errorRed.200"
              >
                Deleted subjects/locations cannot be restored.
              </Text>
            </HStack>
          )}
        </ModalBody>

        <ModalFooter p={0}>
          <Button
            ref={cancelRef}
            onClick={onClose}
            flex="1"
            size="lg"
            colorScheme="blue"
            variant="outline"
            height="35px"
            textStyle="button"
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
            textStyle="button"
          >
            Proceed
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SystemChangesConfirmationDialog;
