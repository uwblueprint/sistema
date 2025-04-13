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

interface ConfirmAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  lessonDate: string;
}

export const ConfirmAbsenceModal: React.FC<ConfirmAbsenceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  lessonDate,
}) => {
  const formattedDate = new Date(lessonDate + 'T00:00:00').toLocaleDateString(
    'en-CA',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Absence</ModalHeader>
        <ModalBody>
          <Text>
            Please confirm your absence on <strong>{formattedDate}</strong>.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={isSubmitting}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
