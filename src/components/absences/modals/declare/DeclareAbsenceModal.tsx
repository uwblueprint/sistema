import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import DeclareAbsenceForm from './DeclareAbsenceForm';

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
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent w={362} sx={{ padding: '33px 31px' }} borderRadius="16px">
      <ModalHeader fontSize={22} p="0 0 28px 0">
        Declare Absence
      </ModalHeader>
      <ModalCloseButton top="33px" right="28px" color="text.header" />
      <ModalBody p={0}>
        <DeclareAbsenceForm
          onClose={onClose}
          initialDate={initialDate}
          userId={userId}
          onTabChange={onTabChange}
          isAdminMode={isAdminMode}
          fetchAbsences={fetchAbsences}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default DeclareAbsenceModal;
