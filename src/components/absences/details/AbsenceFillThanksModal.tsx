import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useTheme,
} from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';

const AbsenceFillThanks = ({ isOpen, onClose, event, absenceDate }) => {
  const theme = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        width="319px"
        padding="25px"
        sx={{
          alignItems: 'center',
        }}
      >
        <ModalHeader
          textStyle="h3"
          fontSize="16px"
          padding="0"
          textAlign="center"
        >
          <Flex align="center" justify="center" gap={2}>
            <FiCheckCircle
              size="20px"
              color={theme.colors.positiveGreen[200]}
            />
            <Text>Thank you!</Text>
          </Flex>
        </ModalHeader>

        <ModalBody
          textStyle="subtitle"
          color="text"
          padding="0"
          my="30px"
          textAlign="center"
        >
          <Text as="span">You have successfully filled </Text>
          <Text as="span" fontWeight="bold">
            {event?.absentTeacher?.firstName + "'s"}
          </Text>
          {' absence on '}
          <Text as="span" fontWeight="bold">
            {absenceDate}.
          </Text>

          <Text my="12px">Make sure to review the lesson plan!</Text>

          <Text as="span" fontWeight="bold">
            Note:
          </Text>
          <Text as="span"> Please contact admin for any modifications.</Text>
        </ModalBody>

        <ModalFooter padding="0" width="full" justifyContent="center">
          <Button
            onClick={onClose}
            textStyle="button"
            fontWeight="500"
            width="235px"
          >
            Got it!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AbsenceFillThanks;
