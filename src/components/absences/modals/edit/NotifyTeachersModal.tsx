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

interface NotifyTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const NotifyTeachersModal: React.FC<NotifyTeachersModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent width="300px" padding="25px" alignItems="center">
        <ModalHeader padding="0">
          <Text textStyle="h3">Notify Teachers?</Text>
        </ModalHeader>
        <ModalBody
          textStyle="subtitle"
          color="text"
          padding="0"
          mt="12px"
          mb="16px"
          textAlign="center"
        >
          <Text>Would you like to send emails to teachers involved?</Text>
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
              Don&apos;t Send
            </Button>
            <Button
              onClick={onConfirm}
              isLoading={isSubmitting}
              textStyle="button"
              width="100px"
              height="35px"
            >
              Send
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
