import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  Textarea,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { Absence, Prisma } from '@prisma/client';
import { formatFullDate } from '@utils/formatDate';
import { submitAbsence } from '@utils/submitAbsence';
import { validateAbsenceForm } from '@utils/validateAbsenceForm';
import { useState } from 'react';
import { useCustomToast } from '../../../CustomToast';
import { FileUpload } from '../../FileUpload';
import { AdminTeacherFields } from '../AdminTeacherFields';
import { DateOfAbsence } from '../DateOfAbsence';
import { InputDropdown } from '../InputDropdown';
import { ConfirmDeclareModal } from './ConfirmDeclareModal';

interface DeclareAbsenceFormProps {
  onClose?: () => void;
  userId: number;
  onTabChange: (tab: 'explore' | 'declared') => void;
  initialDate: Date;
  isAdminMode: boolean;
  fetchAbsences: () => Promise<void>;
}

const DeclareAbsenceForm: React.FC<DeclareAbsenceFormProps> = ({
  onClose,
  userId,
  onTabChange,
  initialDate,
  isAdminMode,
  fetchAbsences,
}) => {
  const showToast = useCustomToast();
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reasonOfAbsence: '',
    absentTeacherId: isAdminMode ? '' : String(userId),
    substituteTeacherId: '',
    locationId: '',
    subjectId: '',
    roomNumber: '',
    lessonDate: initialDate.toLocaleDateString('en-CA'),
    notes: '',
  });
  const [lessonPlan, setLessonPlan] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors = validateAbsenceForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast({
        description: 'Please fill in all required fields correctly.',
        status: 'error',
      });
      return;
    }
    onOpen();
  };

  const handleConfirmSubmit = async () => {
    closeModal();
    setIsSubmitting(true);

    try {
      const formattedDate = formatFullDate(formData.lessonDate);

      const success = await submitAbsence({
        formData,
        lessonPlan,
        onDeclareAbsence: handleDeclareAbsence,
      });

      if (success) {
        showToast({
          status: 'success',
          description: (
            <Text>
              You have successfully declared an absence on{' '}
              <Text as="span" fontWeight="bold">
                {formattedDate}.
              </Text>
            </Text>
          ),
        });

        const userIsInvolved =
          parseInt(formData.substituteTeacherId, 10) === userId ||
          parseInt(formData.absentTeacherId, 10) === userId;

        if (userIsInvolved) {
          onTabChange('declared');
        }

        onClose?.();
      } else {
        showToast({
          status: 'error',
          description: 'Failed to declare absence',
        });
      }
    } catch (error) {
      showToast({
        description:
          error instanceof Error ? error.message : 'Failed to declare absence',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclareAbsence = async (
    absence: Prisma.AbsenceCreateManyInput
  ): Promise<Absence | null> => {
    try {
      const res = await fetch('/api/declareAbsence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(absence),
      });

      if (!res.ok) {
        throw new Error(`Failed to add absence: ${res.statusText}`);
      }

      const addedAbsence = await res.json();
      await fetchAbsences();
      return addedAbsence;
    } catch (error) {
      console.error('Error adding absence:', error);
      return null;
    }
  };

  const handleDateSelect = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      lessonDate: date.toISOString().split('T')[0],
    }));
  };

  const selectedDate = new Date(formData.lessonDate + 'T00:00:00');
  const now = new Date();
  const isWithin14Days =
    (selectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 14;

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      sx={{
        label: { fontSize: '14px', fontWeight: '400' },
      }}
    >
      <VStack sx={{ gap: '24px' }}>
        {isAdminMode && (
          <AdminTeacherFields
            formData={formData}
            errors={errors}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        )}

        <FormControl isRequired isInvalid={!!errors.subjectId}>
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Subject</Text>
          </FormLabel>
          <InputDropdown
            label="subject"
            type="subject"
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                subjectId: value ? String(value.id) : '',
              }));
              if (errors.subjectId) {
                setErrors((prev) => ({
                  ...prev,
                  subjectId: '',
                }));
              }
            }}
          />
          <FormErrorMessage>{errors.subjectId}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.locationId}>
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Location</Text>
          </FormLabel>
          <InputDropdown
            label="location"
            type="location"
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                locationId: value ? String(value.id) : '',
              }));
              if (errors.locationId) {
                setErrors((prev) => ({
                  ...prev,
                  locationId: '',
                }));
              }
            }}
          />
          <FormErrorMessage>{errors.locationId}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="roomNumber" sx={{ display: 'flex' }}>
            <Text textStyle="h4">Room Number</Text>
          </FormLabel>
          <Input
            id="roomNumber"
            name="roomNumber"
            placeholder="e.g. 2131"
            value={formData.roomNumber}
            onChange={handleChange}
          />
        </FormControl>
        <DateOfAbsence
          dateValue={initialDate}
          onDateSelect={handleDateSelect}
          error={errors.lessonDate}
        />

        <FormControl isRequired isInvalid={!!errors.reasonOfAbsence}>
          <FormLabel htmlFor="reasonOfAbsence" sx={{ display: 'flex' }}>
            <Text textStyle="h4">Reason of Absence</Text>
          </FormLabel>
          <Textarea
            id="reasonOfAbsence"
            name="reasonOfAbsence"
            placeholder="Only visible to admin"
            value={formData.reasonOfAbsence}
            onChange={handleChange}
            minH="88px"
          />
          <FormErrorMessage>{errors.reasonOfAbsence}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <Text textStyle="h4" mb={2}>
            Lesson Plan
          </Text>
          <FileUpload lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="notes" sx={{ display: 'flex' }}>
            <Text textStyle="h4">Notes</Text>
          </FormLabel>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Visible to everyone"
            value={formData.notes}
            onChange={handleChange}
            minH="88px"
          />
        </FormControl>

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText="Submitting"
          width="full"
          height="44px"
        >
          Declare Absence
        </Button>
      </VStack>
      <ConfirmDeclareModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        lessonDate={formData.lessonDate}
        hasLessonPlan={!!lessonPlan}
        isWithin14Days={isWithin14Days}
      />
    </Box>
  );
};

export default DeclareAbsenceForm;
