import {
  Button,
  Modal,
  ModalBody,
  HStack,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

interface DeleteAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteAbsenceModal: React.FC<DeleteAbsenceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay />
    <ModalContent width="300px" padding="25px" alignItems="center">
      <ModalHeader
        textStyle="h3"
        fontSize="16px"
        padding="0"
        textAlign="center"
      >
        Are you sure you want to delete this absence?
      </ModalHeader>
      <ModalBody
        textStyle="subtitle"
        color="text"
        padding="0"
        mt="12px"
        mb="16px"
        textAlign="center"
      >
        <Text>You won&apos;t be able to undo this action.</Text>
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
            Delete
          </Button>
        </HStack>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default DeleteAbsenceModal;
