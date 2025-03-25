import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  IconButton,
  Box,
  VStack,
  Flex,
  useToast,
  ModalFooter,
  Button,
} from '@chakra-ui/react';
import { FiEdit2, FiMapPin, FiTrash2, FiUser } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import { Calendar, Buildings } from 'iconsax-react';
import AbsenceStatusTag from './AbsenceStatusTag';
import LessonPlanView from './LessonPlanView';
import { useRouter } from 'next/router';

const AbsenceDetails = ({ isOpen, onClose, event, onDelete }) => {
  const { data: session, status } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();
  const router = useRouter();

  if (!event) return null;

  const userId = session?.user?.id ? Number(session.user.id) : undefined;
  const isUserAbsentTeacher = userId === event.absentTeacher.id;
  const isUserSubstituteTeacher = userId === event.substituteTeacher?.id;
  const isUserAdmin = true;

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/deleteAbsence`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isUserAdmin: isUserAdmin,
          absenceId: event.absenceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete absence');
      }

      toast({
        title: 'Absence deleted',
        description: 'The absence has been successfully deleted.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setIsDeleteDialogOpen(false);
      onClose();

      if (onDelete) {
        onDelete(event.absenceId);
      } else {
        router.reload();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete absence',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent width="362px" borderRadius="15px" padding="30px">
          <ModalHeader p="0">
            <Flex justify="space-between" align="center" position="relative">
              <AbsenceStatusTag
                isUserAbsentTeacher={isUserAbsentTeacher}
                isUserSubstituteTeacher={isUserSubstituteTeacher}
                isUserAdmin={isUserAdmin}
                substituteTeacherFullName={event.substituteTeacherFullName}
              />
              <Flex position="absolute" right="0">
                {isUserAdmin && (
                  <>
                    <IconButton
                      aria-label="Edit Absence"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      color="#656565"
                    />

                    <IconButton
                      aria-label="Delete Absence"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      color="#656565"
                      onClick={handleDeleteClick}
                    />
                  </>
                )}

                <ModalCloseButton color="#2D3748" position="static" />
              </Flex>
            </Flex>
          </ModalHeader>

          <ModalBody sx={{ padding: '20px 0 0 0' }}>
            <VStack spacing="18px" align="stretch">
              <Text fontSize="22px" fontWeight="500">
                {' '}
                {event.title}{' '}
              </Text>
              <Flex gap="13px">
                <FiMapPin size="20px" color="#0468C1" />
                <Text fontSize="13px" color="#373636">
                  {' '}
                  {event.location}{' '}
                </Text>
              </Flex>
              <Flex gap="13px" mt="-8px">
                <Calendar size="20px" color="#0468C1" />
                <Text fontSize="13px" color="#373636">
                  {event.start
                    ? new Date(event.start).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </Text>
              </Flex>
              <Flex gap="13px" mt="-8px">
                <FiUser size="20px" color="#0468C1" />
                <Text fontSize="13px" color="#373636">
                  {' '}
                  {event.absentTeacherFullName}{' '}
                </Text>
              </Flex>
              {event.roomNumber && (
                <Flex gap="13px" mt="-8px">
                  <Buildings size="20px" color="#0468C1" />
                  <Text fontSize="13px" color="#373636">
                    {' '}
                    Room {event.roomNumber}{' '}
                  </Text>
                </Flex>
              )}
              <Box>
                <Text fontSize="14px" fontWeight="500" mb="9px">
                  Lesson Plan
                </Text>
                <LessonPlanView
                  lessonPlan={event.lessonPlan}
                  absentTeacherFirstName={event.absentTeacher.firstName}
                  isUserAbsentTeacher={isUserAbsentTeacher}
                />
              </Box>
              {isUserAdmin && (
                <Box>
                  <Text fontSize="14px" fontWeight="500" mb="9px">
                    Reason of Absence
                  </Text>
                  <Text
                    fontSize="12px"
                    sx={{
                      padding: '15px 15px 33px 15px',
                      borderRadius: '10px',
                    }}
                    background="#F7F7F7"
                  >
                    {event.reasonOfAbsence}
                  </Text>
                </Box>
              )}
              {(event.notes || isUserAbsentTeacher) && (
                <Box position="relative">
                  <Text fontSize="14px" fontWeight="500" mb="9px">
                    Notes
                  </Text>

                  <Box
                    fontSize="12px"
                    sx={{
                      padding: '15px 15px 33px 15px',
                      borderRadius: '10px',
                      background: '#F7F7F7',
                    }}
                  >
                    {event.notes}
                  </Box>

                  {isUserAbsentTeacher && (
                    <IconButton
                      aria-label="Edit Notes"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      color="#656565"
                      position="absolute"
                      bottom="5px"
                      right="5px"
                    />
                  )}
                </Box>
              )}

              {/* Visibility Tag*/}
              {event.substituteTeacher &&
                (isUserAbsentTeacher || isUserSubstituteTeacher) && (
                  <Flex
                    gap="10px"
                    align="center"
                    color="#373636"
                    fontSize="12px"
                  >
                    {isUserAbsentTeacher ? (
                      <>
                        <IoEyeOutline size="14px" />
                        <Text>
                          {' '}
                          Only visible to{' '}
                          <Text as="span" fontWeight={700}>
                            Me
                          </Text>{' '}
                          and{' '}
                          <Text as="span" fontWeight={700}>
                            {event.substituteTeacher.firstName}
                          </Text>
                          .
                        </Text>
                      </>
                    ) : isUserSubstituteTeacher ? (
                      <>
                        <IoEyeOutline size="14px" />
                        <Text>
                          {' '}
                          Only visible to{' '}
                          <Text as="span" fontWeight={700}>
                            Me
                          </Text>{' '}
                          and{' '}
                          <Text as="span" fontWeight={700}>
                            {event.absentTeacher.firstName}
                          </Text>
                          .
                        </Text>
                      </>
                    ) : null}
                  </Flex>
                )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Absence</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this absence?</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleDeleteCancel} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AbsenceDetails;
