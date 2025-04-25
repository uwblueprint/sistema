import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
  useTheme,
} from '@chakra-ui/react';
import { EventDetails } from '@utils/types';
import { Buildings, Calendar } from 'iconsax-react';
import { BiSolidErrorCircle } from 'react-icons/bi';
import { FiEdit2, FiMapPin, FiTrash2, FiUser } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import AbsenceStatusTag from './AbsenceStatusTag';
import EditableNotes from './EditableNotes';
import LessonPlanView from './LessonPlanView';

interface AbsenceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails;
  absenceDate: string;
  isUserAbsentTeacher: boolean;
  isUserSubstituteTeacher: boolean;
  isAdminMode: boolean;
  hasConflictingEvent: boolean;
  fetchAbsences: () => Promise<void>;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleFillAbsenceClick: () => void;
  blockScrollOnMount: boolean;
}

const AbsenceDetailsModal: React.FC<AbsenceDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  absenceDate,
  isUserAbsentTeacher,
  isUserSubstituteTeacher,
  isAdminMode,
  hasConflictingEvent,
  fetchAbsences,
  handleEditClick,
  handleDeleteClick,
  handleFillAbsenceClick,
  blockScrollOnMount,
}) => {
  const theme = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isCentered
      blockScrollOnMount={blockScrollOnMount}
    >
      <ModalContent
        width="362px"
        borderRadius="15px"
        padding="30px"
        boxShadow="0px 0px 25px 0px rgba(0, 0, 0, 0.25)"
      >
        <ModalHeader p="0">
          <Flex justify="space-between" align="center" position="relative">
            <Flex gap="8px" align="center">
              <AbsenceStatusTag
                isUserAbsentTeacher={isUserAbsentTeacher}
                isAdminMode={isAdminMode}
                substituteTeacherFullName={
                  event.substituteTeacherFullName ?? undefined
                }
              />
              {hasConflictingEvent &&
                !event.substituteTeacherFullName &&
                !isUserAbsentTeacher &&
                !isAdminMode && (
                  <Popover placement="top" trigger="hover" isLazy>
                    <PopoverTrigger>
                      <Box display="flex" alignItems="center" height="100%">
                        <Icon
                          as={BiSolidErrorCircle}
                          color={theme.colors.errorRed['200']}
                          boxSize={6}
                        />
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent bg="white" width="fit-content">
                      <PopoverArrow />
                      <PopoverBody textStyle="caption" maxW="190px">
                        You have already filled an absence on this date.
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                )}
            </Flex>
            <Flex position="absolute" right="0">
              {isAdminMode && (
                <IconButton
                  aria-label="Edit Absence"
                  icon={<FiEdit2 size="15px" color={theme.colors.text.body} />}
                  size="sm"
                  variant="ghost"
                  onClick={handleEditClick}
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
            <Flex gap="13px" align="center">
              <FiMapPin
                size="20px"
                color={theme.colors.primaryBlue[300]}
                style={{ strokeWidth: 1.5 }}
              />
              <Text textStyle="subtitle" color={theme.colors.text.body}>
                {event.location}
              </Text>
            </Flex>
            <Flex gap="13px" mt="-8px" align="center">
              <Calendar size="20px" color={theme.colors.primaryBlue[300]} />
              <Text textStyle="subtitle" color={theme.colors.text.body}>
                {absenceDate}
              </Text>
            </Flex>
            <Flex gap="13px" mt="-8px" align="center">
              <FiUser
                size="20px"
                color={theme.colors.primaryBlue[300]}
                style={{ strokeWidth: 1.5 }}
              />
              <Text textStyle="subtitle" color={theme.colors.text.body}>
                {event.absentTeacherFullName}
              </Text>
            </Flex>
            {event.roomNumber && (
              <Flex gap="13px" mt="-8px" align="center">
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
                  background={theme.colors.neutralGray[50]}
                  sx={{ padding: '15px 15px 33px 15px', borderRadius: '10px' }}
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
              <Box>
                <Text textStyle="h4" mb="9px">
                  Notes
                </Text>
                <Box
                  fontSize="12px"
                  background={theme.colors.neutralGray[50]}
                  sx={{ padding: '15px 15px 33px 15px', borderRadius: '10px' }}
                >
                  {event.notes}
                </Box>
              </Box>
            )}

            {event.substituteTeacher &&
              !isAdminMode &&
              (isUserAbsentTeacher || isUserSubstituteTeacher) && (
                <Flex gap="10px" align="center" textStyle="caption">
                  <IoEyeOutline size="14px" />
                  <Text>
                    Only visible to{' '}
                    <Text as="span" fontWeight="bold">
                      {event.absentTeacher.firstName}
                    </Text>{' '}
                    and{' '}
                    <Text as="span" fontWeight="bold">
                      {event.substituteTeacher.firstName}.
                    </Text>
                  </Text>
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
                  onClick={handleFillAbsenceClick}
                  disabled={hasConflictingEvent}
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

export default AbsenceDetailsModal;
