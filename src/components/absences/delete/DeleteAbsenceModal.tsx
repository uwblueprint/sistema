import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useUserData } from '@hooks/useUserData';
import { formatFullDate } from '@utils/formatDate';
import { EventDetails, Role } from '@utils/types';
import { useState } from 'react';
import { CustomToastOptions } from '../../CustomToast';
interface DeleteAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  absenceId: number;
  onDelete: (absenceId: number) => Promise<void>;
  event: EventDetails;
  showToast: (options: CustomToastOptions) => void;
}

const DeleteAbsenceModal: React.FC<DeleteAbsenceModalProps> = ({
  isOpen,
  onClose,
  absenceId,
  onDelete,
  event,
  showToast,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const userData = useUserData();
  const isUserAdmin = userData.role === Role.ADMIN;

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/deleteAbsence`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isUserAdmin,
          absenceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete absence');
      }

      const formattedDate = formatFullDate(event.start!!);

      showToast({
        status: 'success',
        description: (
          <Text>
            You have successfully deleted{' '}
            <Text as="span" fontWeight="bold">
              {event.absentTeacher.firstName}&apos;s
            </Text>{' '}
            absence on{' '}
            <Text as="span" fontWeight="bold">
              {formattedDate}.
            </Text>
          </Text>
        ),
      });

      onDelete(absenceId);
      onClose();
    } catch (error) {
      showToast({
        description: error.message || 'Failed to delete absence',
        status: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Absence</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Are you sure you want to delete this absence?</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} isLoading={isDeleting}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteAbsenceModal;
