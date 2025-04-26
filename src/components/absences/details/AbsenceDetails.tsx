import { Text, useDisclosure } from '@chakra-ui/react';
import { useUserData } from '@hooks/useUserData';
import { formatFullDate } from '@utils/dates';
import { EventDetails, Role } from '@utils/types';
import { useRef, useState } from 'react';
import { useCustomToast } from '../../CustomToast';
import { MailIcon } from '../modals/edit/EditAbsenceForm';
import EditAbsenceModal from '../modals/edit/EditAbsenceModal';
import { NotifyTeachersModal } from '../modals/edit/NotifyTeachersModal';
import AbsenceDetailsModal from './AbsenceDetailsModal';
import AbsenceFillThanksModal from './AbsenceFillThanksModal';
import DeleteAbsenceModal from './DeleteAbsenceModal';
import FillAbsenceModal from './FillAbsenceModal';

interface AbsenceDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails;
  onDelete?: (absenceId: number) => void;
  onTabChange: (tab: 'explore' | 'declared') => void;
  isAdminMode: boolean;
  fetchAbsences: () => Promise<void>;
  hasConflictingEvent: boolean;
}

const AbsenceDetails: React.FC<AbsenceDetailsProps> = ({
  isOpen,
  onClose,
  event,
  onDelete,
  onTabChange,
  isAdminMode,
  fetchAbsences,
  hasConflictingEvent,
}) => {
  const userData = useUserData();
  const showToast = useCustomToast();
  const showToastRef = useRef(showToast);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNotifyingDelete, setIsNotifyingDelete] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  const [isFillThanksOpen, setIsFillThanksOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<{
    teacher: { firstName: string; lastName: string; email: string };
    substituteTeacher?: { firstName: string; lastName: string; email: string };
    absence: {
      lessonDate: Date;
      subject: { name: string };
      location: { name: string };
    };
  } | null>(null);

  const {
    isOpen: isNotifyOpen,
    onOpen: openNotify,
    onClose: closeNotify,
  } = useDisclosure();

  if (!event) return null;

  const userId = userData.id;
  const isUserAbsentTeacher = userId === event.absentTeacher.id;
  const isUserSubstituteTeacher = userId === event.substituteTeacher?.id;
  const isUserAdmin = userData.role === Role.ADMIN;
  const absenceDate = formatFullDate(event.start!!);

  const handleFillConfirm = async () => {
    setIsFilling(true);
    try {
      const response = await fetch('/api/editAbsence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
        const errorText = await response.json().catch(() => null);
        const errorMessage =
          errorText?.error ||
          `Failed to fill absence: ${response.statusText || 'Unknown error'}`;
        console.error(errorMessage);
        showToastRef.current({ status: 'error', description: errorMessage });
        return;
      }

      const emailRes = await fetch('/api/emails/fillAbsence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ absenceId: event.absenceId }),
      });

      if (!emailRes.ok) {
        const errorText = await emailRes.json().catch(() => null);
        const errorMessage =
          errorText?.error ||
          `Filled absence, but failed to send confirmation email: ${emailRes.statusText || 'Unknown error'}`;
        console.error(errorMessage);
        showToastRef.current({ status: 'error', description: errorMessage });
      } else {
        const successMessage = (
          <Text>
            You have successfully filled{' '}
            <Text as="span" fontWeight="bold">
              {event.absentTeacher.firstName}&apos;s
            </Text>{' '}
            absence on{' '}
            <Text as="span" fontWeight="bold">
              {absenceDate}.
            </Text>
          </Text>
        );
        showToastRef.current({
          status: 'success',
          description: successMessage,
        });
      }

      await fetchAbsences();
      setIsFillModalOpen(false);
      setIsFillThanksOpen(true);
      onTabChange('declared');
    } catch (error: any) {
      const errorMessage = error?.message
        ? `An error occurred while filling the absence: ${error.message}`
        : 'An error occurred while filling the absence.';
      console.error(errorMessage, error);
      showToastRef.current({ status: 'error', description: errorMessage });
    } finally {
      setIsFilling(false);
      onClose();
    }
  };

  const handleNotifyDeleteConfirm = async () => {
    setIsNotifyingDelete(true);
    try {
      if (!pendingDeletion) {
        const errorMessage = 'No deletion data to email.';
        console.error(errorMessage);
        showToastRef.current({
          status: 'error',
          description: errorMessage,
          icon: <MailIcon bg="errorRed.200" />,
        });
        return;
      }

      const emailRes = await fetch('/api/emails/deleteAbsence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingDeletion),
      });

      if (!emailRes.ok) {
        const errorText = await emailRes.json().catch(() => null);
        const errorMessage =
          errorText?.error ||
          `Failed to send delete absence emails: ${emailRes.statusText || 'Unknown error'}`;
        console.error(errorMessage);
        showToastRef.current({
          status: 'error',
          description: errorMessage,
          icon: <MailIcon bg="errorRed.200" />,
        });
        return;
      }

      showToastRef.current({
        status: 'success',
        description: 'Delete absence emails have been sent',
        icon: <MailIcon bg="positiveGreen.200" />,
      });
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to send delete absence emails: ${error.message}`
        : 'Failed to send delete absence emails.';
      console.error(errorMessage, error);
      showToastRef.current({
        status: 'error',
        description: errorMessage,
        icon: <MailIcon bg="errorRed.200" />,
      });
    } finally {
      setIsNotifyingDelete(false);
      handleNotifyClose();
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      setPendingDeletion({
        teacher: {
          firstName: event.absentTeacher.firstName,
          lastName: event.absentTeacher.lastName,
          email: event.absentTeacher.email,
        },
        substituteTeacher: event.substituteTeacher
          ? {
              firstName: event.substituteTeacher.firstName,
              lastName: event.substituteTeacher.lastName,
              email: event.substituteTeacher.email,
            }
          : undefined,
        absence: {
          lessonDate: event.start,
          subject: { name: event.title },
          location: { name: event.location },
        },
      });

      const response = await fetch('/api/deleteAbsence', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUserAdmin, absenceId: event.absenceId }),
      });

      if (!response.ok) {
        const errorText = await response.json().catch(() => null);
        const errorMessage =
          errorText?.error ||
          `Failed to delete absence: ${response.statusText || 'Unknown error'}`;
        console.error(errorMessage);
        showToastRef.current({ status: 'error', description: errorMessage });
        return;
      }

      onDelete?.(event.absenceId);
      await fetchAbsences();
      setIsDeleteModalOpen(false);

      showToastRef.current({
        status: 'success',
        description: (
          <Text>
            You have successfully deleted{' '}
            <Text as="span" fontWeight="bold">
              {event.absentTeacher.firstName}&apos;s
            </Text>{' '}
            absence on{' '}
            <Text as="span" fontWeight="bold">
              {absenceDate}.
            </Text>
          </Text>
        ),
      });

      if (isAdminMode) {
        openNotify();
      } else {
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error?.message
        ? `There was an error deleting absence: ${error.message}`
        : 'There was an error deleting absence.';
      console.error(errorMessage, error);
      showToastRef.current({ status: 'error', description: errorMessage });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFillAbsenceClick = () => {
    setIsFillModalOpen(true);
  };

  const handleNotifyClose = () => {
    closeNotify();
    onClose();
  };

  const handleFillCancel = () => {
    setIsFillModalOpen(false);
  };

  const handleFillThanksDone = () => {
    setIsFillThanksOpen(false);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <AbsenceDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        event={event}
        absenceDate={absenceDate}
        isUserAbsentTeacher={isUserAbsentTeacher}
        isUserSubstituteTeacher={isUserSubstituteTeacher}
        isAdminMode={isAdminMode}
        hasConflictingEvent={hasConflictingEvent}
        fetchAbsences={fetchAbsences}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
        handleFillAbsenceClick={handleFillAbsenceClick}
        blockScrollOnMount={!isEditModalOpen}
      />
      <FillAbsenceModal
        isOpen={isFillModalOpen}
        onClose={handleFillCancel}
        onConfirm={handleFillConfirm}
        isLoading={isFilling}
      />
      <AbsenceFillThanksModal
        isOpen={isFillThanksOpen}
        onClose={handleFillThanksDone}
        event={event}
        absenceDate={absenceDate}
      />
      <DeleteAbsenceModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
      <EditAbsenceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          onClose();
        }}
        initialData={event}
        isAdminMode={isAdminMode}
        fetchAbsences={fetchAbsences}
      />
      <NotifyTeachersModal
        isOpen={isNotifyOpen}
        onClose={handleNotifyClose}
        onConfirm={handleNotifyDeleteConfirm}
        isSubmitting={isNotifyingDelete}
      />
    </>
  );
};

export default AbsenceDetails;
