import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
        <ModalHeader p="0">
          <Text textStyle="h3" textAlign="center">
            Are you sure you want to fill this absence?
          </Text>
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
        <ModalFooter p={0}>
          <HStack spacing="20px">
            <Button
              onClick={onClose}
              variant="outline"
              textStyle="button"
              width="100px"
              height="35px"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              textStyle="button"
              isLoading={isLoading}
              width="100px"
              height="35px"
            >
              Confirm
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FillAbsenceModal;
