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
import AbsenceStatusTag from './AbsenceStatusTag';

const AbsenceDetails = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader position="relative">
          <AbsenceStatusTag substituteTeacher={event.substituteTeacher} />

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
          <Text fontSize="2xl" fontWeight="bold" mt={3} mb={3}>
            <strong> {event.title || 'Absence Details'}</strong>
          </Text>
          <Text>
            <strong>Location:</strong> {event.location}
          </Text>
          <Text>
            <strong>Date:</strong> {event.start || 'Unknown'}
          </Text>
          <Text>
            <strong>Absent Teacher:</strong> {event.absentTeacher}
          </Text>

          <Text mt={3}>
            <strong>Lesson Plan:</strong>
          </Text>
          {event.lessonPlan && (
            <Button
              as={Link}
              href={event.lessonPlan} // assuming this is a URL to the file
              isExternal
            >
              Download
            </Button>
          )}

          <Text mt={3}>
            <strong>Reason of Absence:</strong>
          </Text>
          <Text>{event.reasonOfAbsence}</Text>

          {event.notes && (
            <>
              <Text mt={3} fontWeight="bold">
                Notes:
              </Text>
              <Text>{event.notes}</Text>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AbsenceDetails;
