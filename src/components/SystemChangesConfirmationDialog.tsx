import {
  Button,
  useDisclosure,
  Text,
  VStack,
  Box,
  Divider,
} from '@chakra-ui/react';
import React from 'react';
import ConfirmationDialog from './ConfirmationDialog';

export type ChangeType = 'delete' | 'archive' | 'unarchive' | 'update' | 'add';

export interface Change {
  type: ChangeType;
  entity: 'subject' | 'location' | 'setting';
  id?: number;
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
  const getDisplayableChanges = (changes: Change[]): string[] => {
    const displayChanges: string[] = [];

    if (changes.length === 0) {
      return ['No changes to apply'];
    }

    // Process each change to create more granular display items
    changes.forEach((change) => {
      if (change.type === 'add') {
        // Only show the main "Added Subject/Location" message
        displayChanges.push(
          `Added ${change.entity === 'subject' ? 'Subject' : 'Location'} "${change.data.name}"`
        );
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
        // Name changes
        if (change.data.name !== undefined) {
          const entityList = change.entity === 'subject' ? subjects : locations;
          const entity = entityList.find((e) => e.id === change.id);
          // Use the original name we stored when the change was created
          const originalName =
            change.data.originalName || entity?.name || 'Unknown';

          displayChanges.push(
            `Updated ${change.entity === 'subject' ? 'Subject' : 'Location'} Name "${originalName}" → "${change.data.name}"`
          );
        }

        // Abbreviation changes
        if (change.data.abbreviation !== undefined) {
          const entityList = change.entity === 'subject' ? subjects : locations;
          const entity = entityList.find((e) => e.id === change.id);
          // Use the original abbreviation we stored when the change was created
          const originalAbbr =
            change.data.originalAbbreviation ||
            entity?.abbreviation ||
            'Unknown';

          displayChanges.push(
            `Updated Display "${originalAbbr}" → "${change.data.abbreviation}"`
          );
        }

        // Color changes for subjects
        if (
          change.entity === 'subject' &&
          change.data.colorGroupId !== undefined
        ) {
          const subject = subjects.find((s) => s.id === change.id);
          // Get from original stored value if available, otherwise from the current subject data
          const originalColorGroupId =
            change.data.originalColorGroupId || subject?.colorGroupId;
          const oldColorGroup = colorGroups.find(
            (cg) => cg.id === originalColorGroupId
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
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
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
  );
};

export default SystemChangesConfirmationDialog;
