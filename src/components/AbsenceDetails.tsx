import { useSession } from 'next-auth/react';
import React from 'react';
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
  Button,
} from '@chakra-ui/react';
import { FiEdit2, FiMapPin, FiTrash2, FiUser } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import { Calendar, Buildings } from 'iconsax-react';
import AbsenceStatusTag from './AbsenceStatusTag';
import LessonPlanView from './LessonPlanView';

const AbsenceDetails = ({ isOpen, onClose, event }) => {
  const { data: session, status } = useSession();
  if (!event) return null;

  const userId = session?.user?.id ? Number(session.user.id) : undefined;
  const isUserAbsentTeacher = userId === event.absentTeacher.id;
  const isUserSubstituteTeacher = userId === event.substituteTeacher?.id;
  const isUserAdmin = false;

  return (
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
                    icon={<FiEdit2 size="15px" color="#373636" />}
                    size="sm"
                    variant="ghost"
                  />
                </>
              )}

              {(isUserAdmin ||
                (isUserAbsentTeacher && !event.substituteTeacher)) && (
                <>
                  <IconButton
                    aria-label="Delete Absence"
                    icon={<FiTrash2 size="15px" color="#373636" />}
                    size="sm"
                    variant="ghost"
                  />
                </>
              )}
              <ModalCloseButton color="#373636" position="static" />
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
                isUserSubstituteTeacher={isUserSubstituteTeacher}
              />
            </Box>
            {isUserAdmin && (
              <Box>
                <Text fontSize="14px" fontWeight="500" mb="9px">
                  Reason of Absence
                </Text>
                <Text
                  fontSize="12px"
                  sx={{ padding: '15px 15px 33px 15px', borderRadius: '10px' }}
                  background="#F7F7F7"
                >
                  {event.reasonOfAbsence}
                </Text>
              </Box>
            )}
            {isUserAbsentTeacher && (
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
                  (TO DO: Editable textbox) {'\n'}
                  {event.notes}
                </Box>

                <IconButton
                  aria-label="Edit Notes"
                  icon={<FiEdit2 size="15px" color="#656565" />}
                  size="sm"
                  variant="ghost"
                  position="absolute"
                  bottom="5px"
                  right="5px"
                />
              </Box>
            )}
            {event.notes && !isUserAbsentTeacher && (
              <Box position="relative">
                <Text fontSize="14px" fontWeight="500" mb="9px">
                  Notes
                </Text>

                <Box
                  fontSize="12px"
                  sx={{
                    padding: '15px 15px 15px 15px',
                    borderRadius: '10px',
                    background: '#F7F7F7',
                  }}
                >
                  {event.notes}
                </Box>
              </Box>
            )}

            {/* Visibility Tag*/}
            {event.substituteTeacher &&
              (isUserAbsentTeacher || isUserSubstituteTeacher) && (
                <Flex gap="10px" align="center" color="#373636" fontSize="12px">
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

            {/* Fill Absence Button*/}
            {!event.substituteTeacher &&
              !isUserAbsentTeacher &&
              !isUserAdmin && (
                <Button
                  colorScheme="blue"
                  width="full"
                  height="44px"
                  font-size="16px"
                  fontWeight="500"
                >
                  Fill this Absence
                </Button>
              )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AbsenceDetails;
