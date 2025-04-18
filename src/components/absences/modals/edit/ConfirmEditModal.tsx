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
        <ModalHeader p="0" textAlign="center">
          <Text textStyle="h3">Save Changes?</Text>
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
        <ModalFooter p={0}>
          <HStack spacing="20px">
            <Button
              onClick={onClose}
              variant="outline"
              textStyle="button"
              width="100px"
              height="35px"
            >
              Back
            </Button>
            <Button
              onClick={onConfirm}
              isLoading={isSubmitting}
              textStyle="button"
              width="100px"
              height="35px"
            >
              Save
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
