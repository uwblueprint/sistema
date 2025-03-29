import {
  Box,
  Button,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text,
  VStack,
  useTheme,
} from '@chakra-ui/react';
import { Role } from '@utils/types';
import { useUserData } from '@utils/useUserData';
import { Buildings, Calendar } from 'iconsax-react';
import { FiEdit2, FiMapPin, FiTrash2, FiUser } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import AbsenceStatusTag from './AbsenceStatusTag';
import LessonPlanView from './LessonPlanView';
import { useToast } from '@chakra-ui/react';
import ClaimAbsenceToast from './ClaimAbsenceToast';

const AbsenceDetails = ({ isOpen, onClose, event }) => {
  const theme = useTheme();
  const userData = useUserData();
  const toast = useToast();
  if (!event) return null;

  const userId = userData.id;
  const isUserAbsentTeacher = userId === event.absentTeacher.id;
  const isUserSubstituteTeacher = userId === event.substituteTeacher?.id;
  const isUserAdmin = userData.role === Role.ADMIN;

  return (
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
              isUserAdmin={isUserAdmin}
              substituteTeacherFullName={event.substituteTeacherFullName}
            />
            <Flex position="absolute" right="0">
              {isUserAdmin && (
                <IconButton
                  aria-label="Edit Absence"
                  icon={<FiEdit2 size="15px" color={theme.colors.text.body} />}
                  size="sm"
                  variant="ghost"
                />
              )}

              {(isUserAdmin ||
                (isUserAbsentTeacher && !event.substituteTeacher)) && (
                <IconButton
                  aria-label="Delete Absence"
                  icon={<FiTrash2 size="15px" color={theme.colors.text.body} />}
                  size="sm"
                  variant="ghost"
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
                  ? new Date(event.start).toLocaleDateString('en-US', {
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
                <Buildings size="20px" color={theme.colors.primaryBlue[300]} />
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
              />
            </Box>
            {(isUserAdmin || isUserAbsentTeacher) && (
              <Box>
                <Text textStyle="h4" mb="9px">
                  Reason of Absence
                </Text>
                <Box
                  fontSize="12px"
                  sx={{ padding: '15px 15px 33px 15px', borderRadius: '10px' }}
                  background={theme.colors.neutralGray[50]}
                >
                  {event.reasonOfAbsence}
                </Box>
              </Box>
            )}
            {isUserAbsentTeacher && (
              <Box position="relative">
                <Text textStyle="h4" mb="9px">
                  Notes
                </Text>
                <Box
                  fontSize="12px"
                  sx={{ padding: '15px 15px 33px 15px', borderRadius: '10px' }}
                  background={theme.colors.neutralGray[50]}
                >
                  {event.notes}
                </Box>

                <IconButton
                  aria-label="Edit Notes"
                  icon={<FiEdit2 size="15px" color={theme.colors.text.body} />}
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
            {!event.substituteTeacher && !isUserAbsentTeacher && (
              <Button
                colorScheme="blue"
                width="full"
                height="44px"
                fontSize="16px"
                fontWeight="500"
                onClick={() => {
                  // toast modal is here for now
                  const firstName = event.absentTeacher.firstName;
                  const absenceDate = event.start
                    ? new Date(event.start).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A';
                  toast({
                    position: 'bottom',
                    duration: 10000,
                    isClosable: true,
                    render: () => (
                      <ClaimAbsenceToast
                        firstName={firstName}
                        date={absenceDate}
                        success={false}
                      />
                    ),
                  });
                }}
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
