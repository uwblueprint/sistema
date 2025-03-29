import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  VStack,
  Flex,
  IconButton,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useTheme,
  useToast,
  Portal,
} from '@chakra-ui/react';
import { FiEdit2, FiMapPin, FiTrash2, FiUser, FiX } from 'react-icons/fi';
import { IoEyeOutline } from 'react-icons/io5';
import { Buildings, Calendar } from 'iconsax-react';
import { useUserData } from '@hooks/useUserData';
import { useRouter } from 'next/router';

import AbsenceStatusTag from './AbsenceStatusTag';
import LessonPlanView from './LessonPlanView';
import { Role } from '@utils/types';

const AbsenceDetails = (props) => {
  const { isAdminMode, onDelete } = props;

  const event = props.event || (props.eventInfo ? props.eventInfo.event : null);
  const externalIsOpen = props.isOpen;
  const externalOnClose = props.onClose;

  const theme = useTheme();
  const toast = useToast();
  const router = useRouter();
  const userData = useUserData();
  const eventRef = useRef<HTMLElement | null>(null);

  const [internalIsOpen, setInternalIsOpen] = useState(false);

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setInternalIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleClose = () => {
    setInternalIsOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  };

  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!event) return null;

  const title = event.title || 'Untitled Event';

  const location =
    event.location ||
    (event.extendedProps ? event.extendedProps.location : '') ||
    '';
  const startDate = event.start;
  const absentTeacher =
    event.absentTeacher ||
    (event.extendedProps ? event.extendedProps.absentTeacher : null) ||
    null;
  const absentTeacherFullName =
    event.absentTeacherFullName ||
    (event.extendedProps ? event.extendedProps.absentTeacherFullName : '') ||
    '';
  const substituteTeacher =
    event.substituteTeacher ||
    (event.extendedProps ? event.extendedProps.substituteTeacher : null) ||
    null;
  const substituteTeacherFullName =
    event.substituteTeacherFullName ||
    (event.extendedProps
      ? event.extendedProps.substituteTeacherFullName
      : '') ||
    '';
  const lessonPlan =
    event.lessonPlan ||
    (event.extendedProps ? event.extendedProps.lessonPlan : '') ||
    '';
  const reasonOfAbsence =
    event.reasonOfAbsence ||
    (event.extendedProps ? event.extendedProps.reasonOfAbsence : '') ||
    '';
  const notes =
    event.notes || (event.extendedProps ? event.extendedProps.notes : '') || '';
  const roomNumber =
    event.roomNumber ||
    (event.extendedProps ? event.extendedProps.roomNumber : '') ||
    '';
  const absenceId =
    event.absenceId ||
    (event.extendedProps ? event.extendedProps.absenceId : null);

  const userId = userData?.id;
  const isUserAbsentTeacher = userId === absentTeacher?.id;
  const isUserSubstituteTeacher = userId === substituteTeacher?.id;
  const isUserAdmin = userData?.role === Role.ADMIN;

  const handleDeleteClick = () => {
    onDeleteDialogOpen();
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/deleteAbsence`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isUserAdmin: isUserAdmin,
          absenceId: absenceId,
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

      onDeleteDialogClose();
      handleClose();

      if (onDelete) {
        onDelete(absenceId);
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

  const dayOfWeek = startDate ? new Date(startDate).getDay() : 0;

  const placement = dayOfWeek <= 3 ? 'right' : 'left';

  const getCalendarGridInfo = () => {
    const calendarEl = document.querySelector('.fc-daygrid-body');
    if (!calendarEl) return null;

    const calendarRect = calendarEl.getBoundingClientRect();

    const dayCells = document.querySelectorAll('.fc-daygrid-day');
    if (!dayCells.length) return null;

    const cellWidth = calendarRect.width / 7;

    return {
      cellWidth,
      calendarLeft: calendarRect.left,
      calendarRight: calendarRect.right,
      calendarTop: calendarRect.top,
      calendarBottom: calendarRect.bottom,
    };
  };

  const calculatePopoverPosition = () => {
    if (!event.clickPosition) return null;

    const gridInfo = getCalendarGridInfo();
    if (!gridInfo) return null;

    const { x, y } = event.clickPosition;
    const { cellWidth, calendarLeft, calendarRight } = gridInfo;

    const relativeX = x - calendarLeft;

    const clickedColumn = Math.floor(relativeX / cellWidth);

    const columnCenterX =
      calendarLeft + clickedColumn * cellWidth + cellWidth / 2;

    const offsetX =
      dayOfWeek <= 3
        ? columnCenterX + cellWidth * 0.5
        : columnCenterX - cellWidth * 0.5;

    const finalX = Math.max(
      calendarLeft + 10,
      Math.min(offsetX, calendarRight - 10)
    );

    return {
      x: finalX,
      y,
    };
  };

  const PopoverContents = () => (
    <VStack spacing="18px" align="stretch">
      <Text fontSize="lg" fontWeight="semibold">
        {title}
      </Text>

      <Flex gap="13px">
        <FiMapPin size="20px" color={theme.colors.primaryBlue[300]} />
        <Text fontSize="sm">{location}</Text>
      </Flex>

      <Flex gap="13px" mt="-8px">
        <Calendar size="20px" color={theme.colors.primaryBlue[300]} />
        <Text fontSize="sm">
          {startDate
            ? new Date(startDate).toLocaleDateString('en-CA', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            : 'N/A'}
        </Text>
      </Flex>

      <Flex gap="13px" mt="-8px">
        <FiUser size="20px" color={theme.colors.primaryBlue[300]} />
        <Text fontSize="sm">{absentTeacherFullName}</Text>
      </Flex>

      {roomNumber && (
        <Flex gap="13px" mt="-8px">
          <Buildings size="20px" color={theme.colors.primaryBlue[300]} />
          <Text fontSize="sm">Room {roomNumber}</Text>
        </Flex>
      )}

      <Box>
        <Text fontWeight="semibold" mb="9px">
          Lesson Plan
        </Text>
        <LessonPlanView
          lessonPlan={lessonPlan}
          absentTeacherFirstName={absentTeacher?.firstName}
          isUserAbsentTeacher={isUserAbsentTeacher}
          isUserSubstituteTeacher={isUserSubstituteTeacher}
          isAdminMode={isAdminMode}
        />
      </Box>

      {(isAdminMode || isUserAbsentTeacher) && (
        <Box>
          <Text fontWeight="semibold" mb="9px">
            Reason of Absence
          </Text>
          <Box
            fontSize="12px"
            bg={theme.colors.neutralGray[50]}
            p="15px"
            borderRadius="10px"
          >
            {reasonOfAbsence}
          </Box>
        </Box>
      )}

      {isUserAbsentTeacher && !isAdminMode && (
        <Box position="relative">
          <Text fontWeight="semibold" mb="9px">
            Notes
          </Text>
          <Box
            fontSize="12px"
            bg={theme.colors.neutralGray[50]}
            p="15px"
            borderRadius="10px"
          >
            {notes}
          </Box>
          <IconButton
            aria-label="Edit Notes"
            icon={<FiEdit2 size="15px" color={theme.colors.neutralGray[600]} />}
            size="sm"
            variant="ghost"
            position="absolute"
            bottom="8px"
            right="16px"
          />
        </Box>
      )}

      {notes && (!isUserAbsentTeacher || isAdminMode) && (
        <Box>
          <Text fontWeight="semibold" mb="9px">
            Notes
          </Text>
          <Box
            fontSize="12px"
            bg={theme.colors.neutralGray[50]}
            p="15px"
            borderRadius="10px"
          >
            {notes}
          </Box>
        </Box>
      )}

      {substituteTeacher &&
        !isAdminMode &&
        (isUserAbsentTeacher || isUserSubstituteTeacher) && (
          <Flex gap="10px" align="center" fontSize="xs">
            <IoEyeOutline size="14px" />
            {isUserAbsentTeacher ? (
              <Text>
                Only visible to <strong>{absentTeacher?.firstName}</strong> and{' '}
                <strong>{substituteTeacher?.firstName}</strong>.
              </Text>
            ) : (
              <Text>
                Only visible to <strong>{substituteTeacher?.firstName}</strong>{' '}
                and <strong>{absentTeacher?.firstName}</strong>.
              </Text>
            )}
          </Flex>
        )}

      {!substituteTeacher && !isUserAbsentTeacher && !isAdminMode && (
        <Button width="full" height="44px" fontSize="16px" fontWeight="500">
          Fill this Absence
        </Button>
      )}
    </VStack>
  );

  const PopoverWrapper = ({ children }) => (
    <PopoverContent
      width="362px"
      borderRadius="15px"
      boxShadow="0px 0px 25px rgba(0,0,0,0.25)"
      _focus={{ outline: 'none' }}
    >
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader borderBottom="none" pt="16px" pb="0">
        <Flex justify="space-between" align="center" position="relative">
          <AbsenceStatusTag
            isUserAbsentTeacher={isUserAbsentTeacher}
            isUserSubstituteTeacher={isUserSubstituteTeacher}
            isAdminMode={isAdminMode}
            substituteTeacherFullName={substituteTeacherFullName}
          />
          <Flex position="absolute" right="0">
            {isAdminMode && (
              <IconButton
                aria-label="Edit Absence"
                icon={<FiEdit2 size="15px" color={theme.colors.text.body} />}
                size="sm"
                variant="ghost"
              />
            )}

            {(isAdminMode || (isUserAbsentTeacher && !substituteTeacher)) && (
              <IconButton
                aria-label="Delete Absence"
                icon={<FiTrash2 size="15px" color={theme.colors.text.body} />}
                size="sm"
                variant="ghost"
                onClick={handleDeleteClick}
              />
            )}
          </Flex>
        </Flex>
      </PopoverHeader>

      <PopoverBody pt="10px">{children}</PopoverBody>
    </PopoverContent>
  );

  const getEventBounds = () => {
    if (eventRef.current) {
      const bounds = eventRef.current.getBoundingClientRect();
      return {
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      };
    }
    return null;
  };

  return (
    <>
      {props.eventInfo ? (
        <Popover
          isOpen={internalIsOpen}
          onClose={handleClose}
          placement={placement}
          closeOnBlur={true}
          gutter={10}
          strategy="fixed"
          returnFocusOnClose={false}
        >
          <PopoverTrigger>
            <Box
              onClick={() => setInternalIsOpen(true)}
              cursor="pointer"
              className="fc-event-main"
            >
              <Box className="fc-event-title">{title}</Box>
              <Box fontSize="sm">{location}</Box>
            </Box>
          </PopoverTrigger>

          <PopoverWrapper>
            <PopoverContents />
          </PopoverWrapper>
        </Popover>
      ) : (
        internalIsOpen && (
          <Portal>
            {event.clickPosition ? (
              (() => {
                const position = calculatePopoverPosition();

                if (!position) {
                  return (
                    <Popover
                      isOpen={true}
                      onClose={handleClose}
                      placement={placement}
                      closeOnBlur={true}
                      gutter={10}
                      strategy="fixed"
                      returnFocusOnClose={false}
                    >
                      <PopoverTrigger>
                        <Box
                          position="fixed"
                          top={`${event.clickPosition.y}px`}
                          left={`${event.clickPosition.x}px`}
                          width="1px"
                          height="1px"
                          opacity={0}
                          pointerEvents="none"
                          zIndex={-1}
                        />
                      </PopoverTrigger>

                      <PopoverWrapper>
                        <PopoverContents />
                      </PopoverWrapper>
                    </Popover>
                  );
                }

                return (
                  <Popover
                    isOpen={true}
                    onClose={handleClose}
                    placement={placement}
                    closeOnBlur={true}
                    gutter={10}
                    strategy="fixed"
                    returnFocusOnClose={false}
                  >
                    <PopoverTrigger>
                      <Box
                        position="fixed"
                        top={`${position.y}px`}
                        left={`${position.x}px`}
                        width="1px"
                        height="1px"
                        opacity={0}
                        pointerEvents="none"
                        zIndex={-1}
                      />
                    </PopoverTrigger>

                    <PopoverWrapper>
                      <PopoverContents />
                    </PopoverWrapper>
                  </Popover>
                );
              })()
            ) : (
              <Box
                position="fixed"
                right="20px"
                top="20%"
                zIndex={1500}
                width="362px"
              >
                <Box
                  borderRadius="15px"
                  boxShadow="0px 0px 25px rgba(0,0,0,0.25)"
                  bg="white"
                  position="relative"
                >
                  <IconButton
                    aria-label="Close"
                    icon={<FiX />}
                    size="sm"
                    position="absolute"
                    top="8px"
                    right="8px"
                    onClick={handleClose}
                  />
                  <Box p="16px 16px 0">
                    <Flex
                      justify="space-between"
                      align="center"
                      position="relative"
                    >
                      <AbsenceStatusTag
                        isUserAbsentTeacher={isUserAbsentTeacher}
                        isUserSubstituteTeacher={isUserSubstituteTeacher}
                        isAdminMode={isAdminMode}
                        substituteTeacherFullName={substituteTeacherFullName}
                      />
                      <Flex position="absolute" right="0">
                        {isAdminMode && (
                          <IconButton
                            aria-label="Edit Absence"
                            icon={
                              <FiEdit2
                                size="15px"
                                color={theme.colors.text.body}
                              />
                            }
                            size="sm"
                            variant="ghost"
                          />
                        )}

                        {(isAdminMode ||
                          (isUserAbsentTeacher && !substituteTeacher)) && (
                          <IconButton
                            aria-label="Delete Absence"
                            icon={
                              <FiTrash2
                                size="15px"
                                color={theme.colors.text.body}
                              />
                            }
                            size="sm"
                            variant="ghost"
                            onClick={handleDeleteClick}
                          />
                        )}
                      </Flex>
                    </Flex>
                  </Box>
                  <Box pt="10px" px="16px" pb="16px">
                    <PopoverContents />
                  </Box>
                </Box>
              </Box>
            )}
          </Portal>
        )
      )}

      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={onDeleteDialogClose}
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
            <Button onClick={onDeleteDialogClose} mr={3}>
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
