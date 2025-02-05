import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { Absence, Prisma } from '@prisma/client';
import { useState } from 'react';
import { FileUpload } from './upload';
import { Dropdown } from './Dropdown';
import { SearchDropdown } from './SearchDropdown';

interface InputFormProps {
  onClose?: () => void;
  onAddAbsence: (
    absence: Prisma.AbsenceCreateManyInput
  ) => Promise<Absence | null>;
  initialDate: Date;
}

const InputForm: React.FC<InputFormProps> = ({
  onClose,
  onAddAbsence,
  initialDate,
}) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reasonOfAbsence: '',
    absentTeacherId: '',
    substituteTeacherId: '',
    locationId: '',
    subjectId: '',
    lessonDate: initialDate.toLocaleDateString('en-CA'),
    notes: '',
  });
  const [lessonPlan, setLessonPlan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.absentTeacherId) {
      newErrors.absentTeacherId = 'Absent teacher ID is required';
    }
    if (!formData.locationId) {
      newErrors.locationId = 'Location ID is required';
    }
    if (!formData.subjectId) {
      newErrors.subjectId = 'Subject ID is required';
    }
    if (!formData.reasonOfAbsence) {
      newErrors.reasonOfAbsence = 'Reason of absence is required';
    }
    if (!formData.lessonDate) {
      newErrors.lessonDate = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (url: string) => {
    setLessonPlan(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    try {
      const lessonDate = new Date(formData.lessonDate);
      lessonDate.setHours(lessonDate.getHours() + 12);
      const absenceData: Prisma.AbsenceCreateManyInput = {
        lessonDate: lessonDate,
        lessonPlan: lessonPlan || null,
        reasonOfAbsence: formData.reasonOfAbsence,
        absentTeacherId: parseInt(formData.absentTeacherId, 10),
        substituteTeacherId: formData.substituteTeacherId
          ? parseInt(formData.substituteTeacherId, 10)
          : null,
        locationId: parseInt(formData.locationId, 10),
        subjectId: parseInt(formData.subjectId, 10),
        notes: formData.notes,
      };

      const response = await onAddAbsence(absenceData);

      if (response) {
        toast({
          title: 'Success',
          description: 'Absence has been successfully recorded.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Reset form
        setLessonPlan('');
        setFormData({
          reasonOfAbsence: '',
          absentTeacherId: '',
          substituteTeacherId: '',
          locationId: '',
          subjectId: '',
          lessonDate: initialDate.toISOString().split('T')[0],
          notes: '',
        });

        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add absence',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4}>
      <VStack spacing={4}>
        <FormControl isRequired isInvalid={!!errors.absentTeacherId}>
          <FormLabel>Teacher Absent</FormLabel>
          <SearchDropdown
            label="Teacher"
            type="user"
            onChange={(value) => {
              // Handle selected subject
              setFormData((prev) => ({
                ...prev,
                absentTeacherId: value ? String(value.id) : '',
              }));
              // Clear error when user selects a value
              if (errors.absentTeacherId) {
                setErrors((prev) => ({
                  ...prev,
                  absentTeacherId: '',
                }));
              }
            }}
          />
          <FormErrorMessage>{errors.absentTeacherId}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Substitute Teacher</FormLabel>
          <SearchDropdown
            label="Teacher"
            type="user"
            onChange={(value) => {
              // Handle selected subject
              setFormData((prev) => ({
                ...prev,
                substituteTeacherId: value ? String(value.id) : '',
              }));
              // Clear error when user selects a value
              if (errors.substituteTeacherId) {
                setErrors((prev) => ({
                  ...prev,
                  substituteTeacherId: '',
                }));
              }
            }}
          />
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.subjectId}>
          <FormLabel>Class Type</FormLabel>
          <Dropdown
            label="class type"
            type="subject"
            onChange={(value) => {
              // Handle selected subject
              setFormData((prev) => ({
                ...prev,
                subjectId: value ? String(value.id) : '',
              }));
              // Clear error when user selects a value
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
          <FormLabel>Location</FormLabel>
          <Dropdown
            label="class location"
            type="location"
            onChange={(value) => {
              // Handle selected location
              setFormData((prev) => ({
                ...prev,
                locationId: value ? String(value.id) : '',
              }));
              // Clear error when user selects a value
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

        <FormControl isRequired isInvalid={!!errors.lessonDate}>
          <FormLabel>Date of Absence</FormLabel>
          <Input
            name="lessonDate"
            value={formData.lessonDate}
            onChange={handleChange}
            type="date"
          />
          <FormErrorMessage>{errors.lessonDate}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.reasonOfAbsence}>
          <FormLabel>Reason of Absence</FormLabel>
          <Input
            name="reasonOfAbsence"
            placeholder="Only visible to admin"
            value={formData.reasonOfAbsence}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.reasonOfAbsence}</FormErrorMessage>
        </FormControl>

        <FileUpload onFileUpload={handleFileUpload} />

        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Input
            name="notes"
            placeholder="Additional relevant info..."
            value={formData.notes}
            onChange={handleChange}
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText="Submitting"
          width="full"
        >
          Declare Absence
        </Button>
      </VStack>
    </Box>
  );
};

export default InputForm;
