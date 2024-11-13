import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FileUpload } from './upload';

interface InsertAbsence {
  id?: number;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  locationId: number;
  subjectId: number;
  notes?: string;
  subject?: {
    name: string;
  };
  location?: {
    name: string;
  };
}

interface InputFormProps {
  onClose?: () => void;
  onAddAbsence: (absence: InsertAbsence) => Promise<InsertAbsence | null>;
  initialDate?: Date;
}

const InputForm: React.FC<InputFormProps> = ({
  onClose,
  onAddAbsence,
  initialDate = new Date(),
}) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reasonOfAbsence: '',
    absentTeacherId: '',
    substituteTeacherId: '',
    locationId: '',
    subjectId: '',
    lessonDate: initialDate.toISOString().split('T')[0],
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

      const newAbsence: InsertAbsence = {
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

      const response = await onAddAbsence(newAbsence);

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
          <FormLabel>Absent Teacher</FormLabel>
          <Input
            name="absentTeacherId"
            placeholder="Enter absent teacher ID"
            value={formData.absentTeacherId}
            onChange={handleChange}
            type="number"
          />
          <FormErrorMessage>{errors.absentTeacherId}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Substitute Teacher</FormLabel>
          <Input
            name="substituteTeacherId"
            placeholder="Enter substitute teacher ID"
            value={formData.substituteTeacherId}
            onChange={handleChange}
            type="number"
          />
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.subjectId}>
          <FormLabel>Class Type</FormLabel>
          <Input
            name="subjectId"
            placeholder="Enter subject ID"
            value={formData.subjectId}
            onChange={handleChange}
            type="number"
          />
          <FormErrorMessage>{errors.subjectId}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.locationId}>
          <FormLabel>Location</FormLabel>
          <Input
            name="locationId"
            placeholder="Enter location ID"
            value={formData.locationId}
            onChange={handleChange}
            type="number"
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
            placeholder="Enter reason of absence"
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
