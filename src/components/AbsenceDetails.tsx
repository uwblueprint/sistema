import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Link,
  Button,
} from '@chakra-ui/react';

const ViewAbsence = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{event.title || 'Absence Details'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            <strong>Date:</strong> {event.start || 'Unknown'}
          </Text>
          <Text>
            <strong>Location:</strong> {event.location}
          </Text>
          <Text>
            <strong>Absent Teacher:</strong> {event.absentTeacher}
          </Text>
          <Text>
            <strong>Substitute Teacher:</strong> {event.substituteTeacher}
          </Text>

          {event.notes && (
            <Text mt={3}>
              <strong>Notes:</strong> {event.notes}
            </Text>
          )}

          {event.lessonPlan && (
            <Button
              as={Link}
              href={event.lessonPlan} // assuming this is a URL to the file
              isExternal
              colorScheme="blue"
              mt={3}
            >
              Download Lesson Plan
            </Button>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ViewAbsence;
