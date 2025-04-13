import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';

interface ConfirmEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const ConfirmEditModal: React.FC<ConfirmEditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Save Changes?</ModalHeader>
        <ModalBody>
          <Text>Would you like to save the changes you&apos;ve made?</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Back
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isSubmitting}
            colorScheme="blue"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
