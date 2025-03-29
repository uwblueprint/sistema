import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useTheme,
  VStack,
  Icon,
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
  const theme = useTheme();

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
      <ModalContent
        maxW="300px"
        height={isWithin14Days ? '200px' : '160px'}
        borderRadius="lg"
      >
        <ModalHeader
          textAlign="center"
          fontSize="16px"
          fontWeight="700"
          pb={0}
          pt={5}
        >
          {hasLessonPlan ? 'Confirm Absence' : 'No Lesson Plan Added'}
        </ModalHeader>
        <ModalBody display="flex" justifyContent="center">
          <Box maxW="224px" w="100%">
            <VStack fontSize="13px" align="start" pl={1}>
              <Text fontSize="12px">
                {hasLessonPlan ? (
                  <>
                    Please confirm your absence on{' '}
                    <strong>{formattedDate}</strong>.
                  </>
                ) : (
                  <>
                    Declare absence on <strong>{formattedDate}</strong>, without
                    adding a lesson plan?
                  </>
                )}
              </Text>
              {isWithin14Days && (
                <HStack align="center" spacing={3}>
                  <Icon
                    as={MdWarning}
                    boxSize="25px"
                    color={theme.colors.warningOrange[300]}
                  />
                  <Text
                    fontSize="11px"
                    fontWeight="400"
                    lineHeight="normal"
                    color={theme.colors.warningOrange[300]}
                  >
                    You are submitting a late report. Please aim to report
                    absences at least 14 days in advance.
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        </ModalBody>
        <ModalFooter
          display="flex"
          justifyContent="center"
          gap={5}
          px={0}
          pt={0}
        >
          <Button
            onClick={onClose}
            flex="1"
            maxW="104px"
            h="40px"
            variant="outline"
            borderRadius="lg"
            borderColor="gray.300"
            fontSize="16px"
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
            fontSize="16px"
            font-weight="400"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
