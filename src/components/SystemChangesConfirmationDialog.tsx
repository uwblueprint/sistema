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

export type ChangeType = 'delete' | 'archive' | 'unarchive' | 'update' | 'add';

export interface Change {
  type: ChangeType;
  entity: 'subject' | 'location' | 'setting';
  id?: number;
  tempId?: string;
  data?: any;
  displayText: string;
}

interface SystemChangesConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingChanges: Change[];
  isConfirmingClose?: boolean;
  subjects: any[];
  locations: any[];
  colorGroups: any[];
  absenceCap: number;
}

const SystemChangesConfirmationDialog: React.FC<
  SystemChangesConfirmationDialogProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingChanges,
  isConfirmingClose = false,
  subjects,
  locations,
  colorGroups,
  absenceCap,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const getChangeIcon = (change: Change) => {
    if (change.type === 'delete') {
      return <Icon as={FiTrash2} color="red.500" boxSize={5} />;
    } else if (change.type === 'archive' || change.type === 'unarchive') {
      return <Icon as={FiArchive} color="blue.500" boxSize={5} />;
    } else if (change.type === 'update') {
      return <Icon as={FiEdit2} color="blue.500" boxSize={5} />;
    } else if (change.type === 'add') {
      return <Icon as={IoAdd} color="blue.500" boxSize={8} />;
    }
    return null;
  };

  const getChangeText = (change: Change): { text: string; color: string } => {
    if (change.type === 'delete') {
      return {
        text: `Deleted ${change.entity === 'subject' ? 'Subject' : 'Location'}`,
        color: 'red.500',
      };
    } else if (change.type === 'archive') {
      return {
        text: `Archived ${change.entity === 'subject' ? 'Subject' : 'Location'}`,
        color: 'blue.500',
      };
    } else if (change.type === 'unarchive') {
      return {
        text: `Unarchived ${change.entity === 'subject' ? 'Subject' : 'Location'}`,
        color: 'blue.500',
      };
    }
    return { text: change.displayText, color: 'gray.700' };
  };

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

    if (pendingChanges.length === 0) {
      return [
        {
          icon: null,
          label: 'No changes to apply',
          color: 'gray.700',
          details: '',
        },
      ];
    }

    // Process each change to create more granular display items
    pendingChanges.forEach((change) => {
      if (change.type === 'add') {
        displayChanges.push({
          icon: getChangeIcon(change),
          label: `Added ${change.entity === 'subject' ? 'Subject' : 'Location'}`,
          color: 'blue.500',
          details: `"${change.data.name}"`,
        });
      } else if (change.type === 'delete') {
        const entityName =
          change.entity === 'subject'
            ? subjects.find((s) => s.id === change.id)?.name || 'Unknown'
            : locations.find((l) => l.id === change.id)?.name || 'Unknown';

        displayChanges.push({
          icon: getChangeIcon(change),
          label: `Deleted ${change.entity === 'subject' ? 'Subject' : 'Location'}`,
          color: 'red.500',
          details: `"${entityName}"`,
        });
      } else if (change.type === 'archive' || change.type === 'unarchive') {
        const entityName =
          change.entity === 'subject'
            ? subjects.find((s) => s.id === change.id)?.name
            : locations.find((l) => l.id === change.id)?.name;

        displayChanges.push({
          icon: getChangeIcon(change),
          label: `${change.type === 'archive' ? 'Archived' : 'Unarchived'} ${
            change.entity === 'subject' ? 'Subject' : 'Location'
          }`,
          color: 'blue.500',
          details: `"${entityName || 'Unknown'}"`,
        });
      } else if (change.type === 'update') {
        // We'll handle updates separately for simplicity
        if (change.data?.name !== undefined) {
          // Name changes
          const entityList = change.entity === 'subject' ? subjects : locations;
          const entity = entityList.find((e) => e.id === change.id);
          const originalName =
            change.data.originalName || entity?.name || 'Unknown';

          displayChanges.push({
            icon: getChangeIcon(change),
            label: `Updated ${change.entity === 'subject' ? 'Subject' : 'Location'} Name`,
            color: 'blue.500',
            details: `"${originalName}" → "${change.data.name}"`,
          });
        }

        // Abbreviation changes
        if (change.data?.abbreviation !== undefined) {
          const entityList = change.entity === 'subject' ? subjects : locations;
          const entity = entityList.find((e) => e.id === change.id);
          const originalAbbr =
            change.data.originalAbbreviation || entity?.abbreviation || '';
          const newAbbr = change.data.abbreviation;

          // For updated abbreviations, we need the entity name
          // If the name was also changed in this update, use that as priority
          const entityName =
            // First try to use the name that's also being updated in this change
            change.data.name ||
            // Then try the original name stored with this abbreviation change
            change.data.originalName ||
            // Finally fall back to the current entity name from the subjects/locations list
            entity?.name ||
            'Unknown';

          let label = 'Updated Display';
          let details = `"${originalAbbr}" → "${newAbbr}"`;

          // Handle empty to value case: "Added Display"
          if (originalAbbr === '') {
            label = 'Added Display';
            details = `"${newAbbr}" to "${entityName}"`;
          }
          // Handle value to empty case: "Removed Display"
          else if (newAbbr === '') {
            label = 'Removed Display';
            details = `"${originalAbbr}" from "${entityName}"`;
          }

          displayChanges.push({
            icon: getChangeIcon(change),
            label,
            color: 'blue.500',
            details,
          });
        }

        // Color group changes
        if (
          change.entity === 'subject' &&
          change.data?.colorGroupId !== undefined
        ) {
          const entity = subjects.find((s) => s.id === change.id);
          const originalColorGroupId =
            change.data.originalColorGroupId || entity?.colorGroupId;
          const newColorGroupId = change.data.colorGroupId;

          const originalColorGroup = colorGroups.find(
            (cg) => cg.id === originalColorGroupId
          );
          const newColorGroup = colorGroups.find(
            (cg) => cg.id === newColorGroupId
          );

          // Get entity name for display
          const entityName = entity?.name || 'Unknown Subject';

          displayChanges.push({
            icon: getChangeIcon(change),
            label: `Updated Subject Colour`,
            color: 'blue.500',
            details: (
              <HStack spacing={1}>
                <Text>{entityName}:</Text>
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

        // Absence cap changes
        if (
          change.entity === 'setting' &&
          change.data?.absenceCap !== undefined
        ) {
          displayChanges.push({
            icon: getChangeIcon(change),
            label: `Updated Allowed Absences`,
            color: 'blue.500',
            details: `${absenceCap} → ${change.data.absenceCap}`,
          });
        }
      }
    });

    return displayChanges;
  };

  // Check if there are any delete operations
  const hasDeletedItems = pendingChanges.some(
    (change) => change.type === 'delete'
  );

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            textAlign="center"
            p={4}
          >
            {isConfirmingClose ? (
              'Discard Changes?'
            ) : (
              <Box>
                <Center mb={2}>
                  <Icon
                    as={IoAlertCircleSharp}
                    color="orange.400"
                    boxSize={6}
                  />
                </Center>
                <Text>You are making the following changes.</Text>
                <Text>Do you wish to proceed?</Text>
              </Box>
            )}
          </AlertDialogHeader>

          <AlertDialogBody pb={6}>
            {isConfirmingClose ? (
              <Text>
                You have unsaved changes. Are you sure you want to close without
                saving?
              </Text>
            ) : (
              <VStack
                spacing={4}
                align="stretch"
                p={2}
                borderWidth="1px"
                borderRadius="md"
                borderStyle="dotted"
              >
                {pendingChanges.length > 0 ? (
                  getDisplayableChanges().map((change, index) => (
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
                  ))
                ) : (
                  <Text textAlign="center">No changes to apply</Text>
                )}

                {hasDeletedItems && (
                  <Flex
                    mt={4}
                    color="red.500"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={IoWarning} mr={2} />
                    <Text fontSize="sm">
                      Deleted subjects/locations cannot be restored.
                    </Text>
                  </Flex>
                )}
              </VStack>
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
            >
              Back
            </Button>
            <Button
              colorScheme="blue"
              onClick={onConfirm}
              ml={3}
              flex="1"
              size="lg"
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
