import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  HStack,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { Role, UserAPI } from '@utils/types';

interface ConfirmRoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingUser: UserAPI | null;
  pendingRole: Role | null;
}

const ConfirmRoleChangeModal: React.FC<ConfirmRoleChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingUser,
  pendingRole,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay zIndex={1501} />
      <ModalContent
        width="300px"
        padding="25px"
        alignItems="center"
        containerProps={{
          zIndex: '1501',
        }}
      >
        <ModalHeader p="0">
          <Text textStyle="h3">Confirm Role Change</Text>
        </ModalHeader>
        <ModalBody
          textStyle="subtitle"
          color="text"
          padding="0"
          mt="12px"
          mb="16px"
          textAlign="center"
        >
          <Text>
            Are you sure you want to change{' '}
            <strong>
              {pendingUser?.firstName} {pendingUser?.lastName}
            </strong>{' '}
            to <strong>{pendingRole}</strong>?
          </Text>
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

export default ConfirmRoleChangeModal;
