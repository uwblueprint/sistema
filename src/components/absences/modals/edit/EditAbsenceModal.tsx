import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { EventDetails } from '@utils/types';
import EditAbsenceForm from './EditAbsenceForm';

interface EditAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: EventDetails;
  isAdminMode: boolean;
  fetchAbsences: () => Promise<void>;
}

const EditAbsenceModal: React.FC<EditAbsenceModalProps> = ({
  isOpen,
  onClose,
  initialData,
  isAdminMode,
  fetchAbsences,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent width={362} sx={{ padding: '33px 31px' }} borderRadius="16px">
      <ModalHeader fontSize={22} p="0 0 28px 0">
        Edit Absence
      </ModalHeader>
      <ModalCloseButton top="33px" right="28px" color="text.header" />
      <ModalBody p={0}>
        <EditAbsenceForm
          initialData={initialData}
          isAdminMode={isAdminMode}
          fetchAbsences={fetchAbsences}
          onClose={onClose}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default EditAbsenceModal;
