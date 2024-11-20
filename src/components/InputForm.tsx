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
import Dropdown, { Option } from './Dropdown';

interface Absence {
  id?: number;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  locationId: number;
  subjectId: number;
  notes?: string;
}

interface InputFormProps {
  onClose?: () => void;
  onAddAbsence: (absence: Absence) => Promise<Absence | null>;
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
  const [location, setLocation] = useState<Option | null>(null);
  const [subject, setSubject] = useState<Option | null>(null);
  const [lessonPlan, setLessonPlan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.absentTeacherId) {
      newErrors.absentTeacherId = 'Absent teacher ID is required';
    }
    if (!location) {
      newErrors.location = 'Location is required';
    }
    if (!subject) {
      newErrors.subject = 'Subject is required';
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
    console.log('File uploaded with ID:', url);
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

    if (!onAddAbsence) {
      toast({
        title: 'Configuration Error',
        description: 'Form submission handler is not properly configured.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newAbsence: Absence = {
        lessonDate: new Date(formData.lessonDate),
        lessonPlan: lessonPlan || null,
        reasonOfAbsence: formData.reasonOfAbsence,
        absentTeacherId: parseInt(formData.absentTeacherId, 10),
        substituteTeacherId: formData.substituteTeacherId
          ? parseInt(formData.substituteTeacherId, 10)
          : null,
        locationId: location ? location.id : 0,
        subjectId: subject ? subject.id : 0,
        notes: formData.notes || undefined,
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

        setLessonPlan('');
        // Reset form
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
          <Input
            name="absentTeacherId"
            placeholder="Add teacher"
            value={formData.absentTeacherId}
            onChange={handleChange}
            type="number"
          />
          <FormErrorMessage>{errors.absentTeacherId}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Substitute</FormLabel>
          <Input
            name="substituteTeacherId"
            placeholder="Add teacher"
            value={formData.substituteTeacherId}
            onChange={handleChange}
            type="number"
          />
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.subjectId}>
          <FormLabel>Subject</FormLabel>
          <Dropdown
            label="subject"
            type="subject"
            onChange={(option) => setSubject(option)}
          />
          <FormErrorMessage>{errors.subjectId}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.locationId}>
          <FormLabel>Location</FormLabel>
          <Dropdown
            label="class location"
            type="location"
            onChange={(option) => setLocation(option)}
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
