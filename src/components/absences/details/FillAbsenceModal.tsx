import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from '@chakra-ui/react';

interface FillAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const FillAbsenceModal: React.FC<FillAbsenceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent width="300px" padding="25px" alignItems="center">
        <ModalHeader textStyle="h3" padding="0" textAlign="center">
          Are you sure you want to fill this absence?
        </ModalHeader>
        <ModalBody
          textStyle="subtitle"
          color="text"
          padding="0"
          mt="12px"
          mb="16px"
        >
          <Text>You won&apos;t be able to undo.</Text>
        </ModalBody>
        <ModalFooter padding="0">
          <Button
            onClick={onClose}
            variant="outline"
            textStyle="button"
            fontWeight="500"
            mr="10px"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            textStyle="button"
            fontWeight="500"
            isLoading={isLoading}
            ml="10px"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FillAbsenceModal;
