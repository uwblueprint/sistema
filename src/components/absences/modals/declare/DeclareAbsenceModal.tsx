import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import DeclareAbsenceForm from './DeclareAbsenceForm';
import { useState } from 'react';
import { UnsavedChangesModal } from './UnsavedChangesModal';

interface DeclareAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  userId: number;
  onTabChange: (tab: 'explore' | 'declared') => void;
  isAdminMode: boolean;
  fetchAbsences: () => Promise<void>;
}

const DeclareAbsenceModal: React.FC<DeclareAbsenceModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  userId,
  onTabChange,
  isAdminMode,
  fetchAbsences,
}) => {
  const DefaultFormData = {
    reasonOfAbsence: '',
    absentTeacherId: isAdminMode ? '' : String(userId),
    substituteTeacherId: '',
    locationId: '',
    subjectId: '',
    roomNumber: '',
    lessonDate: initialDate ? initialDate.toLocaleDateString('en-CA') : '',
    notes: '',
  };
  const [formData, setFormData] = useState(DefaultFormData);
  const {
    isOpen: isUnsavedChangesModalOpen,
    onOpen: openUnsavedChangesModal,
    onClose: closeUnsavedChangesModal,
  } = useDisclosure();

  const hasUnsavedChanges = () => {
    return Object.keys(DefaultFormData).some(
      (key) =>
        formData[key as keyof typeof formData] !==
        DefaultFormData[key as keyof typeof DefaultFormData]
    );
  };
  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
      openUnsavedChangesModal();
    } else {
      onClose?.();
    }
  };

  const handleConfirmClose = () => {
    closeUnsavedChangesModal();
    onClose?.();
  };

  return (
    <>
      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onClose={closeUnsavedChangesModal}
        onConfirm={handleConfirmClose}
      />
      <Modal isOpen={isOpen} onClose={handleCloseAttempt}>
        <ModalOverlay />
        <ModalContent w={362} sx={{ padding: '33px 31px' }} borderRadius="16px">
          <ModalHeader fontSize={22} p="0 0 28px 0">
            Declare Absence
          </ModalHeader>
          <ModalCloseButton top="33px" right="28px" color="text.header" />
          <ModalBody p={0}>
            <DeclareAbsenceForm
              onClose={handleCloseAttempt}
              initialDate={initialDate}
              userId={userId}
              onTabChange={onTabChange}
              isAdminMode={isAdminMode}
              fetchAbsences={fetchAbsences}
              formData={formData}
              setFormData={setFormData}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeclareAbsenceModal;
