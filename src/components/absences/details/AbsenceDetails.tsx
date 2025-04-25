import { Text, useDisclosure } from '@chakra-ui/react';
import { useUserData } from '@hooks/useUserData';
import { formatFullDate } from '@utils/dates';
import { EventDetails, Role } from '@utils/types';
import { useState } from 'react';
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

  const showToast = useCustomToast();

  if (!event) return null;

  const userId = userData.id;
  const isUserAbsentTeacher = userId === event.absentTeacher.id;
  const isUserSubstituteTeacher = userId === event.substituteTeacher?.id;
  const isUserAdmin = userData.role === Role.ADMIN;

  const absenceDate = formatFullDate(event.start!!);

  const handleFillThanksDone = () => {
    setIsFillThanksOpen(false);
  };

  const handleFillAbsenceClick = () => {
    setIsFillModalOpen(true);
  };

  const handleFillCancel = () => {
    setIsFillModalOpen(false);
  };

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
        throw new Error('Failed to fill absence');
      }

      const emailRes = await fetch('/api/emails/fillAbsence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ absenceId: event.absenceId }),
      });
      if (!emailRes.ok) {
        console.error('Claim email failed:', await emailRes.text());
      }

      const formattedDate = formatFullDate(event.start);
      showToast({
        status: 'success',
        description: (
          <Text>
            You have successfully filled{' '}
            <Text as="span" fontWeight="bold">
              {event.absentTeacher.firstName}
              &apos;s
            </Text>{' '}
            absence on{' '}
            <Text as="span" fontWeight="bold">
              {formattedDate}.
            </Text>
          </Text>
        ),
      });

      await fetchAbsences();
      setIsFillModalOpen(false);
      setIsFillThanksOpen(true);
      onTabChange('declared');
    } catch (err: any) {
      const formattedDate = formatFullDate(event.start);
      showToast({
        status: 'error',
        description: (
          <Text>
            {err.message.includes('email')
              ? 'Failed to send confirmation email.'
              : 'There was an error in filling '}
            <Text as="span" fontWeight="bold">
              {event.absentTeacher.firstName}
              &apos;s
            </Text>{' '}
            absence on{' '}
            <Text as="span" fontWeight="bold">
              {formattedDate}.
            </Text>
          </Text>
        ),
      });
    } finally {
      setIsFilling(false);
      onClose();
    }
  };

  const handleNotifyDeleteConfirm = async () => {
    setIsNotifyingDelete(true);
    try {
      if (!pendingDeletion) throw new Error('No deletion data to email');
      const emailRes = await fetch('/api/emails/deleteAbsence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingDeletion),
      });
      if (!emailRes.ok) {
        throw new Error((await emailRes.json()).error || emailRes.statusText);
      }

      showToast({
        status: 'success',
        description: 'Delete absence emails have been sent',
        icon: <MailIcon bg="positiveGreen.200" />,
      });
    } catch (err: any) {
      showToast({
        status: 'error',
        description: err.message || 'Failed to send delete absence emails',
        icon: <MailIcon bg="errorRed.200" />,
      });
    } finally {
      setIsNotifyingDelete(false);
      handleNotifyClose();
    }
  };

  const handleNotifyClose = () => {
    closeNotify();
    onClose();
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
      if (!response.ok) throw new Error('Failed to delete absence');

      onDelete?.(event.absenceId);
      await fetchAbsences();
      setIsDeleteModalOpen(false);

      const formattedDate = formatFullDate(event.start);
      showToast({
        status: 'success',
        description: (
          <Text>
            You have successfully deleted{' '}
            <Text as="span" fontWeight="bold">
              {event.absentTeacher.firstName}&apos;s
            </Text>{' '}
            absence on{' '}
            <Text as="span" fontWeight="bold">
              {formattedDate}.
            </Text>
          </Text>
        ),
      });

      if (isAdminMode) {
        openNotify();
      } else {
        onClose();
      }
    } catch (err: any) {
      const formattedDate = formatFullDate(event.start);
      showToast({
        status: 'error',
        description: (
          <Text>
            There was an error deleting{' '}
            <Text as="span" fontWeight="bold">
              {event.absentTeacher.firstName}&apos;s
            </Text>{' '}
            absence on{' '}
            <Text as="span" fontWeight="bold">
              {formattedDate}.
            </Text>
            {err.message && ` (${err.message})`}
          </Text>
        ),
      });
    } finally {
      setIsDeleting(false);
    }
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
