import {
  Alert,
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { MdWarning } from 'react-icons/md';

interface ConfirmAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  lessonDate: string;
  hasLessonPlan: boolean;
  isWithin14Days: boolean;
}

export const ConfirmAbsenceModal: React.FC<ConfirmAbsenceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  lessonDate,
  hasLessonPlan,
  isWithin14Days,
}) => {
  const formattedDate = new Date(lessonDate + 'T00:00:00').toLocaleDateString(
    'en-CA',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="300px" borderRadius="lg">
        <ModalHeader
          textAlign="center"
          fontSize="17px"
          fontWeight="600"
          pb={0}
          px={0}
        >
          {hasLessonPlan ? 'Confirm Absence' : 'No Lesson Plan Added'}
        </ModalHeader>
        <ModalBody display="flex" justifyContent="center">
          <Box maxW="224px" w="100%">
            <VStack spacing={2} fontSize="13px" align="start">
              <Text pb={1}>
                {hasLessonPlan ? (
                  <>
                    Confirm Absence on <strong>{formattedDate}</strong>.
                  </>
                ) : (
                  <>
                    Declare absence on <strong>{formattedDate}</strong> without
                    adding a lesson plan?
                  </>
                )}
              </Text>
              {isWithin14Days && (
                <Alert
                  status="warning"
                  bg="transparent"
                  borderRadius="md"
                  alignItems="start"
                >
                  <Box pt={0.5} pl={0}>
                    <MdWarning size="30px" color="#DD6B20" />
                  </Box>
                  <Box pl={3}>
                    <Text fontSize="12px" fontWeight="500" color="orange.600">
                      You are submitting a late report. Please aim to report
                      absences at least 14 days in advance.
                    </Text>
                  </Box>
                </Alert>
              )}
            </VStack>
          </Box>
        </ModalBody>
        <ModalFooter
          display="flex"
          justifyContent="center"
          gap={4}
          px={0}
          pt={2}
        >
          <Button
            onClick={onClose}
            flex="1"
            maxW="104px"
            h="40px"
            variant="outline"
            borderRadius="lg"
            borderColor="gray.300"
            fontSize="lg"
          >
            Back
          </Button>
          <Button
            colorScheme="blue"
            onClick={onConfirm}
            isLoading={isSubmitting}
            flex="1"
            maxW="104px"
            h="40px"
            borderRadius="lg"
            fontSize="lg"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
