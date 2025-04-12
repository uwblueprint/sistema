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
  useToast,
} from '@chakra-ui/react';
import { Absence } from '@prisma/client';

import { submitAbsence } from '@utils/submitAbsence';
import { EventDetails } from '@utils/types';
import { validateAbsenceForm } from '@utils/validateAbsenceForm';
import { useState } from 'react';
import { AdminTeacherFields } from './AdminTeacherFields';
import { ConfirmEditModal } from './ConfirmEditModal';
import { DateOfAbsence } from './DateOfAbsence';
import { FileUpload } from './FileUpload';
import { InputDropdown } from './InputDropdown';

interface EditAbsenceFormProps {
  onClose?: () => void;
  initialData: EventDetails;
  isAdminMode: boolean;
  fetchAbsences: () => Promise<void>;
}

const EditAbsenceForm: React.FC<EditAbsenceFormProps> = ({
  onClose,
  initialData,
  isAdminMode,
  fetchAbsences,
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reasonOfAbsence: initialData.reasonOfAbsence,
    absentTeacherId: String(initialData.absentTeacher.id),
    substituteTeacherId: initialData.substituteTeacher
      ? String(initialData.substituteTeacher.id)
      : '',
    locationId: String(initialData.locationId),
    subjectId: String(initialData.subjectId),
    roomNumber: initialData.roomNumber || '',
    lessonDate: initialData.start.toLocaleDateString('en-CA'),
    notes: initialData.notes || '',
  });

  const [lessonPlan, setLessonPlan] = useState<File | null>(null);
  const existingLessonPlan = initialData.lessonPlan || null;

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
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    onOpen();
  };

  const handleConfirmSubmit = async () => {
    closeModal();
    setIsSubmitting(true);

    try {
      const result = await submitAbsence({
        formData: { ...formData, id: initialData.absenceId },
        lessonPlan,
        onEditAbsence: handleEditAbsence,
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: `Absence updated successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        fetchAbsences();
        onClose?.();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update absence',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAbsence = async (
    absence: Partial<Absence> & { id: number }
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/editAbsence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(absence),
      });

      if (!res.ok) {
        throw new Error(`Failed to update absence: ${res.statusText}`);
      }

      await fetchAbsences();
      return true;
    } catch (error) {
      console.error('Error editing absence:', error);
      return false;
    }
  };

  const handleDateSelect = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      lessonDate: date.toISOString().split('T')[0],
    }));
  };

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
            defaultValueId={Number(formData.subjectId)}
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
            defaultValueId={Number(formData.locationId)}
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
          dateValue={initialData.start}
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
          <FileUpload
            lessonPlan={lessonPlan}
            setLessonPlan={setLessonPlan}
            existingFile={existingLessonPlan}
          />
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
          loadingText="Updating"
          width="full"
          height="44px"
        >
          Save Changes
        </Button>
      </VStack>
      <ConfirmEditModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
};

export default EditAbsenceForm;
