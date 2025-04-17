import {
  Box,
  Button,
  CloseButton,
  Flex,
  IconButton,
  Text,
  VStack,
  useTheme,
  useToast,
} from '@chakra-ui/react';
import { useUserData } from '@hooks/useUserData';
import { EventDetails, Role } from '@utils/types';
import { Buildings, Calendar } from 'iconsax-react';
import { useState } from 'react';
import { FiEdit2, FiMapPin, FiTrash2, FiUser } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import AbsenceStatusTag from './AbsenceStatusTag';
import EditableNotes from './EditableNotes';
import LessonPlanView from './LessonPlanView';

interface AbsenceDetailsProps {
  onClose: () => void;
  event: EventDetails;
  onDelete?: (absenceId: number) => void;
  isAdminMode: boolean;
  fetchAbsences: () => Promise<void>;
  onFillClick: () => void;
  onEditClick: () => void;
}

// This component is the content of the popover, not the entire popover/modal
const AbsenceDetails: React.FC<AbsenceDetailsProps> = ({
  onClose,
  event,
  onDelete,
  isAdminMode,
  fetchAbsences,
  onFillClick,
  onEditClick,
}) => {
  const theme = useTheme();
  const userData = useUserData();

  const toast = useToast();

  if (!event) return null;

  const userId = userData.id;
  const isUserAbsentTeacher = userId === event.absentTeacher.id;
  const isUserSubstituteTeacher = userId === event.substituteTeacher?.id;
  const isUserAdmin = userData.role === Role.ADMIN;

  const getOrdinalNum = (number) => {
    let selector;

    if (number <= 0) {
      selector = 4;
    } else if ((number > 3 && number < 21) || number % 10 > 3) {
      selector = 0;
    } else {
      selector = number % 10;
    }

    return number + ['th', 'st', 'nd', 'rd', ''][selector];
  };

  const formatDate = (date: Date) => {
    const parsedDate = new Date(date);
    const weekday = parsedDate.toLocaleDateString('en-CA', { weekday: 'long' });
    const month = parsedDate.toLocaleDateString('en-CA', { month: 'long' });
    const day = parsedDate.getDate();

    return `${weekday}, ${month} ${getOrdinalNum(day)}`;
  };

  const absenceDate = formatDate(event.start!!);

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(event.absenceId);
    }
  };

  return (
    <>
      <Box>
        <Flex justify="space-between" align="center" position="relative">
          <AbsenceStatusTag
            isUserAbsentTeacher={isUserAbsentTeacher}
            isUserSubstituteTeacher={isUserSubstituteTeacher}
            isAdminMode={isAdminMode}
            substituteTeacherFullName={
              event.substituteTeacherFullName
                ? event.substituteTeacherFullName
                : undefined
            }
          />
          <Flex position="absolute" right="0">
            {isAdminMode && (
              <IconButton
                aria-label="Edit Absence"
                icon={<FiEdit2 size="15px" color={theme.colors.text.body} />}
                size="sm"
                variant="ghost"
                onClick={() => {
                  onClose();
                  onEditClick();
                }}
              />
            )}

            {(isAdminMode ||
              (isUserAbsentTeacher && !event.substituteTeacher)) && (
              <IconButton
                aria-label="Delete Absence"
                icon={<FiTrash2 size="15px" color={theme.colors.text.body} />}
                size="sm"
                variant="ghost"
                onClick={handleDeleteClick}
              />
            )}
            <CloseButton
              aria-label="Close"
              onClick={onClose}
              color={theme.colors.text.body}
            />
          </Flex>
        </Flex>

        <Box sx={{ padding: '20px 0 0 0' }}>
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
                {absenceDate}
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
                absenceId={event.absenceId}
                absentTeacherFirstName={event.absentTeacher.firstName}
                isUserAbsentTeacher={isUserAbsentTeacher}
                isUserSubstituteTeacher={isUserSubstituteTeacher}
                isAdminMode={isAdminMode}
                fetchAbsences={fetchAbsences}
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
              <EditableNotes
                notes={event.notes}
                absenceId={event.absenceId}
                fetchAbsences={fetchAbsences}
              />
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

            {!event.substituteTeacher &&
              !isUserAbsentTeacher &&
              !isAdminMode && (
                <Button
                  width="full"
                  height="44px"
                  fontSize="16px"
                  fontWeight="500"
                  onClick={onFillClick}
                >
                  Fill this Absence
                </Button>
              )}
          </VStack>
        </Box>
      </Box>
    </>
  );
};

export default AbsenceDetails;
