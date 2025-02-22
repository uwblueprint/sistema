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
  IconButton,
  Box,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const AbsenceDetails = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader position="relative">
          {event.title || 'Absence Details'}

          <Box position="absolute" top="3px" right="45px">
            <IconButton
              aria-label="Edit Absence"
              icon={<FiEdit2 />}
              size="md"
              variant="ghost"
              color="gray.600"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
            />

            <IconButton
              aria-label="Delete Absence"
              icon={<FiTrash2 />}
              size="md"
              variant="ghost"
              color="gray.600"
              onClick={() => {
                onClose();
                onDelete(event);
              }}
            />
          </Box>
        </ModalHeader>
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

export default AbsenceDetails;
