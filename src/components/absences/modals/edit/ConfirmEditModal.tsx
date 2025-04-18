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
      <ModalContent width="300px" padding="25px" alignItems="center">
        <ModalHeader
          textStyle="h3"
          fontSize="16px"
          padding="0"
          textAlign="center"
        >
          Save Changes?
        </ModalHeader>
        <ModalBody
          textStyle="subtitle"
          color="text"
          padding="0"
          mt="12px"
          mb="16px"
          textAlign="center"
        >
          <Text>Would you like to save the changes you&apos;ve made?</Text>
        </ModalBody>
        <ModalFooter padding="0">
          <Button
            onClick={onClose}
            variant="outline"
            textStyle="button"
            fontWeight="500"
            mr="10px"
          >
            Back
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isSubmitting}
            textStyle="button"
            fontWeight="500"
            ml="10px"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
