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
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
  useTheme,
  useToast,
} from '@chakra-ui/react';
import { useUserData } from '@hooks/useUserData';
import { EventDetails, Role } from '@utils/types';
import { Buildings, Calendar } from 'iconsax-react';
import { useState } from 'react';
import { BiSolidErrorCircle } from 'react-icons/bi';
import { FiEdit2, FiMapPin, FiTrash2, FiUser } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import AbsenceClaimThanks from './AbsenceClaimThanks';
import AbsenceStatusTag from './AbsenceStatusTag';
import EditAbsenceForm from './EditAbsenceForm';
import LessonPlanView from './LessonPlanView';

interface AbsenceDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails;
  onDelete?: (absenceId: number) => void;
  isAdminMode: boolean;
  fetchAbsences: () => Promise<void>;
  hasConflictingEvent: boolean;
}

const AbsenceDetails: React.FC<AbsenceDetailsProps> = ({
  isOpen,
  onClose,
  event,
  onDelete,
  isAdminMode,
  fetchAbsences,
  hasConflictingEvent,
}) => {
  const theme = useTheme();
  const userData = useUserData();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isClaimThanksOpen, setIsClaimThanksOpen] = useState(false);

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

  const handleClaimThanksDone = () => {
    setIsClaimThanksOpen(false);
  };

  const handleClaimAbsenceClick = () => {
    setIsClaimDialogOpen(true);
  };

  const handleClaimCancel = () => {
    setIsClaimDialogOpen(false);
  };

  const handleClaimConfirm = async () => {
    setIsClaiming(true);

    try {
      const response = await fetch('/api/editAbsence', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: event.absenceId,
          lessonDate: event.start,
          reasonOfAbsence: event.reasonOfAbsence,
          notes: event.notes,
          absentTeacherId: event.absentTeacher.id,
          substituteTeacherId: userData.id,
          locationId: event.locationId,
          subjectId: event.subjectId,
          roomNumber: event.roomNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim absence');
      }

      toast({
        title: 'Absence claimed',
        description: 'You have successfully claimed this absence.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await fetchAbsences();
      setIsClaimDialogOpen(false);
      setIsClaimThanksOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim absence',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsClaiming(false);
      onClose();
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

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
          isUserAdmin,
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

      await fetchAbsences();
      setIsDeleteDialogOpen(false);
      onClose();

      if (onDelete) {
        onDelete(event.absenceId);
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
              <Flex gap="8px" align="center">
                <AbsenceStatusTag
                  isUserAbsentTeacher={isUserAbsentTeacher}
                  isUserSubstituteTeacher={isUserSubstituteTeacher}
                  isAdminMode={isAdminMode}
                />
                {hasConflictingEvent &&
                  !event.substituteTeacherFullName &&
                  !isUserAbsentTeacher && (
                    <Popover placement="top" trigger="hover">
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
                    icon={
                      <FiEdit2 size="15px" color={theme.colors.text.body} />
                    }
                    size="sm"
                    variant="ghost"
                    onClick={handleEditClick}
                  />
                )}

                {(isAdminMode ||
                  (isUserAbsentTeacher && !event.substituteTeacher)) && (
                  <IconButton
                    aria-label="Delete Absence"
                    icon={
                      <FiTrash2 size="15px" color={theme.colors.text.body} />
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

              {!event.substituteTeacher &&
                !isUserAbsentTeacher &&
                !isAdminMode && (
                  <Button
                    width="full"
                    height="44px"
                    fontSize="16px"
                    fontWeight="500"
                    onClick={handleClaimAbsenceClick}
                  >
                    Fill this Absence
                  </Button>
                )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isClaimDialogOpen} onClose={handleClaimCancel} isCentered>
        <ModalOverlay />
        <ModalContent
          width="300px"
          padding="25px"
          sx={{
            alignItems: 'center',
          }}
        >
          <ModalHeader
            textStyle="h3"
            fontSize="16px"
            padding="0"
            textAlign="center"
          >
            Are you sure you want to fill this absence?
          </ModalHeader>
          <ModalBody
            textStyle="subtitle"
            color="text"
            padding="0"
            mt="12px"
            mb="16px"
          >
            <Text>{"You won't be able to undo."}</Text>
          </ModalBody>
          <ModalFooter padding="0">
            <Button
              onClick={handleClaimCancel}
              variant="outline"
              textStyle="button"
              fontWeight="500"
              mr="10px"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClaimConfirm}
              textStyle="button"
              fontWeight="500"
              isLoading={isClaiming}
              ml="10px"
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AbsenceClaimThanks
        isOpen={isClaimThanksOpen}
        onClose={handleClaimThanksDone}
        event={event}
        absenceDate={absenceDate}
      />
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
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            width={362}
            sx={{ padding: '33px 31px' }}
            borderRadius="16px"
          >
            <ModalHeader fontSize={22} p="0 0 28px 0">
              Edit Absence
            </ModalHeader>
            <ModalCloseButton top="33px" right="28px" color="text.header" />
            <ModalBody p={0}>
              <EditAbsenceForm
                initialData={event}
                isAdminMode={isAdminMode}
                fetchAbsences={fetchAbsences}
                onClose={() => setIsEditModalOpen(false)}
                onFinishedEdit={onClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default AbsenceDetails;
