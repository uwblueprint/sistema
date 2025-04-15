import {
  Box,
  Button,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { IoWarning } from 'react-icons/io5';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      motionPreset="scale"
      closeOnOverlayClick={false}
      preserveScrollBarGap
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" transition="all 0.3s ease" />
      <ModalContent
        p={8}
        width="sm"
        maxHeight="80vh"
        boxShadow="2xl"
        zIndex={1500}
      >
        <ModalHeader fontSize="lg" fontWeight="bold" pb={4} pt={0} px={0}>
          <Text textStyle="h3" fontWeight="600">
            Discard Changes?
          </Text>
        </ModalHeader>

        <ModalBody pb={2} px={0}>
          <VStack
            spacing={4}
            align="stretch"
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderStyle="dotted"
            mb={2}
          >
            <HStack spacing={3} align="center">
              <Box w="40px" textAlign="center">
                <Icon as={IoWarning} color="orange.400" boxSize={5} />
              </Box>
              <Text textStyle="cellBody">
                You have unsaved changes. Are you sure you want to close without
                saving?
              </Text>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter p={0}>
          <Button
            ref={cancelRef}
            onClick={onClose}
            flex="1"
            size="lg"
            colorScheme="blue"
            variant="outline"
            height="35px"
            textStyle="button"
          >
            Keep Editing
          </Button>
          <Button
            colorScheme="blue"
            onClick={onConfirm}
            ml={3}
            flex="1"
            size="lg"
            height="35px"
            textStyle="button"
          >
            Discard
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UnsavedChangesDialog;
