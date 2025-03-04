import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  VStack,
  HStack,
  Text,
  Icon,
} from '@chakra-ui/react';
import { useRef } from 'react';
import {
  IoWarningOutline,
  IoTrashOutline,
  IoArchiveOutline,
  IoSaveOutline,
} from 'react-icons/io5';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  changes: string[];
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  changes,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <HStack>
              <Icon as={IoWarningOutline} color="orange.500" />
              <Text>{title}</Text>
            </HStack>
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text mb={4}>Do you wish to proceed?</Text>
            <VStack align="stretch" spacing={2}>
              {changes.map((change, index) => {
                // Determine icon based on the content of the change string
                let icon;
                let color;

                if (change.includes('Deleted')) {
                  icon = IoTrashOutline;
                  color = 'red.500';
                } else if (change.includes('Archived')) {
                  icon = IoArchiveOutline;
                  color = 'orange.500';
                } else {
                  icon = IoSaveOutline;
                  color = 'blue.500';
                }

                return (
                  <HStack key={index} spacing={3}>
                    <Icon as={icon} color={color} />
                    <Text>{change}</Text>
                  </HStack>
                );
              })}
            </VStack>
            <Text mt={4} fontWeight="bold" color="red.500">
              Deleted subjects/locations cannot be restored.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Back
            </Button>
            <Button colorScheme="blue" onClick={onConfirm} ml={3}>
              Proceed
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
