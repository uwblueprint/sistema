import { WarningTwoIcon } from '@chakra-ui/icons';
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
  useTheme,
  VStack,
} from '@chakra-ui/react';

interface ConfirmDeclareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  lessonDate: string;
  hasLessonPlan: boolean;
  isWithin14Days: boolean;
}

export const ConfirmDeclareModal: React.FC<ConfirmDeclareModalProps> = ({
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
      <ModalContent maxW="300px" borderRadius="lg">
        <ModalHeader textAlign="center" fontSize="16px" pb={0} pt={5}>
          <Text textStyle="h3">
            {hasLessonPlan ? 'Confirm Absence' : 'No Lesson Plan Added'}
          </Text>
        </ModalHeader>
        <ModalBody display="flex" justifyContent="center" mb={2}>
          <Box maxW="224px" w="100%">
            <VStack align="start" pl={1}>
              <Text textStyle="subtitle" color="black">
                {hasLessonPlan ? (
                  <>
                    Please confirm your absence on{' '}
                    <strong>{formattedDate}.</strong>
                  </>
                ) : (
                  <>
                    Declare absence on <strong>{formattedDate}</strong> without
                    adding a lesson plan?
                  </>
                )}
              </Text>
              {isWithin14Days && (
                <HStack align="center" spacing={3}>
                  <Icon
                    as={WarningTwoIcon}
                    boxSize="20px"
                    color={theme.colors.warningOrange[300]}
                  />
                  <Text
                    textStyle="body"
                    color={theme.colors.warningOrange[300]}
                  >
                    You are submitting a late report. Please email the
                    Operations Manager and your Centre Director as soon as
                    possible to inform them of this last minute absence. Aim to
                    report absences at least 14 days in advance.
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
            h="35px"
            variant="outline"
          >
            Back
          </Button>
          <Button
            colorScheme="blue"
            onClick={onConfirm}
            isLoading={isSubmitting}
            flex="1"
            maxW="104px"
            h="35px"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
