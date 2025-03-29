import {
  Box,
  Button,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useTheme,
  useToast,
} from '@chakra-ui/react';
import { useUserData } from '@hooks/useUserData';
import { Buildings, Calendar } from 'iconsax-react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FiEdit2, FiMapPin, FiTrash2, FiUser } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import AbsenceStatusTag from './AbsenceStatusTag';
import LessonPlanView from './LessonPlanView';
import { Role } from '@utils/types';

const AbsenceDetails = ({ isOpen, onClose, event, isAdminMode, onDelete }) => {
  const theme = useTheme();
  const userData = useUserData();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();
  const router = useRouter();

  if (!event) return null;

  const userId = userData.id;
  const isUserAbsentTeacher = userId === event.absentTeacher.id;
  const isUserSubstituteTeacher = userId === event.substituteTeacher?.id;
  const isUserAdmin = userData.role === Role.ADMIN;

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
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalContent
          width="362px"
          borderRadius="15px"
          padding="30px"
          boxShadow="0px 0px 25px 0px rgba(0, 0, 0, 0.25)"
        >
          <ModalHeader p="0">
            <Flex justify="space-between" align="center" position="relative">
              <AbsenceStatusTag
                isUserAbsentTeacher={isUserAbsentTeacher}
                isUserSubstituteTeacher={isUserSubstituteTeacher}
                isAdminMode={isAdminMode}
                substituteTeacherFullName={event.substituteTeacherFullName}
              />
              <Flex position="absolute" right="0">
                {isAdminMode && (
                  <IconButton
                    aria-label="Edit Absence"
                    icon={
                      <FiEdit2
                        size="15px"
                        color={theme.colors.neutralGray[600]}
                      />
                    }
                    size="sm"
                    variant="ghost"
                  />
                )}

                {(isAdminMode ||
                  (isUserAbsentTeacher && !event.substituteTeacher)) && (
                  <IconButton
                    aria-label="Delete Absence"
                    icon={
                      <FiTrash2
                        size="15px"
                        color={theme.colors.neutralGray[600]}
                      />
                    }
                    size="sm"
                    variant="ghost"
                    onClick={handleDeleteClick}
                  />
                )}
                <ModalCloseButton
                  color={theme.colors.text.body}
                  position="static"
                />
              </Flex>
            </Flex>
          </ModalHeader>

          <ModalBody sx={{ padding: '20px 0 0 0' }}>
            <VStack spacing="18px" align="stretch">
              <Text textStyle="h2">{event.title}</Text>
              <Flex gap="13px">
                <FiMapPin size="20px" color={theme.colors.primaryBlue[300]} />
                <Text textStyle="subtitle" color={theme.colors.text.body}>
                  {event.location}
                </Text>
              </Flex>
              <Flex gap="13px" mt="-8px">
                <Calendar size="20px" color={theme.colors.primaryBlue[300]} />
                <Text textStyle="subtitle" color={theme.colors.text.body}>
                  {event.start
                    ? new Date(event.start).toLocaleDateString('en-CA', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </Text>
              </Flex>
              <Flex gap="13px" mt="-8px">
                <FiUser size="20px" color={theme.colors.primaryBlue[300]} />
                <Text textStyle="subtitle" color={theme.colors.text.body}>
                  {event.absentTeacherFullName}
                </Text>
              </Flex>
              {event.roomNumber && (
                <Flex gap="13px" mt="-8px">
                  <Buildings
                    size="20px"
                    color={theme.colors.primaryBlue[300]}
                  />
                  <Text textStyle="subtitle" color={theme.colors.text.body}>
                    Room {event.roomNumber}
                  </Text>
                </Flex>
              )}
              <Box>
                <Text textStyle="h4" mb="9px">
                  Lesson Plan
                </Text>
                <LessonPlanView
                  lessonPlan={event.lessonPlan}
                  absentTeacherFirstName={event.absentTeacher.firstName}
                  isUserAbsentTeacher={isUserAbsentTeacher}
                  isUserSubstituteTeacher={isUserSubstituteTeacher}
                  isAdminMode={isAdminMode}
                />
              </Box>
              {(isAdminMode || isUserAbsentTeacher) && (
                <Box>
                  <Text textStyle="h4" mb="9px">
                    Reason of Absence
                  </Text>
                  <Box
                    fontSize="12px"
                    sx={{
                      padding: '15px 15px 33px 15px',
                      borderRadius: '10px',
                    }}
                    background={theme.colors.neutralGray[50]}
                  >
                    {event.reasonOfAbsence}
                  </Box>
                </Box>
              )}
              {isUserAbsentTeacher && !isAdminMode && (
                <Box position="relative">
                  <Text textStyle="h4" mb="9px">
                    Notes
                  </Text>
                  <Box
                    fontSize="12px"
                    sx={{
                      padding: '15px 15px 33px 15px',
                      borderRadius: '10px',
                    }}
                    background={theme.colors.neutralGray[50]}
                  >
                    {event.notes}
                  </Box>

                  <IconButton
                    aria-label="Edit Notes"
                    icon={
                      <FiEdit2
                        size="15px"
                        color={theme.colors.neutralGray[600]}
                      />
                    }
                    size="sm"
                    variant="ghost"
                    position="absolute"
                    bottom="8px"
                    right="16px"
                  />
                </Box>
              )}
              {event.notes && (!isUserAbsentTeacher || isAdminMode) && (
                <Box position="relative">
                  <Text textStyle="h4" mb="9px">
                    Notes
                  </Text>

                  <Box
                    fontSize="12px"
                    sx={{
                      padding: '15px 15px 33px 15px',
                      borderRadius: '10px',
                      background: `${theme.colors.neutralGray[50]}`,
                    }}
                  >
                    {event.notes}
                  </Box>
                </Box>
              )}

              {/* Visibility Tag*/}
              {event.substituteTeacher &&
                !isAdminMode &&
                (isUserAbsentTeacher || isUserSubstituteTeacher) && (
                  <Flex gap="10px" align="center" textStyle="caption">
                    {isUserAbsentTeacher ? (
                      <>
                        <IoEyeOutline size="14px" />
                        <Text>
                          {' '}
                          Only visible to{' '}
                          <Text as="span" fontWeight={700}>
                            {event.absentTeacher.firstName}
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
                            {event.substituteTeacher.firstName}
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

              {/* Fill Absence Button*/}
              {!event.substituteTeacher &&
                !isUserAbsentTeacher &&
                !isAdminMode && (
                  <Button
                    colorScheme="blue"
                    width="full"
                    height="44px"
                    fontSize="16px"
                    fontWeight="500"
                  >
                    Fill this Absence
                  </Button>
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
            <Button onClick={handleDeleteConfirm} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AbsenceDetails;
