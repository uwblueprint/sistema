import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
} from '@chakra-ui/react';

interface Absence {
  id?: number;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  locationId: number;
  subjectId: number;
}

interface InputFormProps {
  initialDate: Date;
  onClose: () => void;
  onAddAbsence: (newAbsence: Absence) => Promise<Absence | null>;
}

const InputForm: React.FC<InputFormProps> = ({
  initialDate,
  onClose,
  onAddAbsence,
}) => {
  const [lessonPlan, setLessonPlan] = useState('');
  const [reasonOfAbsence, setReasonOfAbsence] = useState('');
  const [absentTeacherId, setAbsentTeacherId] = useState('');
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [error, setError] = useState('');

  const handleAddAbsence = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newAbsence: Absence = {
        lessonDate: initialDate,
        lessonPlan: lessonPlan || null,
        reasonOfAbsence,
        absentTeacherId: parseInt(absentTeacherId, 10),
        substituteTeacherId: substituteTeacherId
          ? parseInt(substituteTeacherId, 10)
          : null,
        locationId: parseInt(locationId, 10),
        subjectId: parseInt(subjectId, 10),
      };

      // Pass the newAbsence object to onAddAbsence and await the response
      const success = await onAddAbsence(newAbsence);

      if (success) {
        // Clear the form on successful submission
        setLessonPlan('');
        setReasonOfAbsence('');
        setAbsentTeacherId('');
        setSubstituteTeacherId('');
        setLocationId('');
        setSubjectId('');
        onClose();
      } else {
        setError('Invalid input. Please enter correct details.');
      }
    } catch (err) {
      // In case of any error, set the error message
      setError(err);
    }
  };

  return (
    <Box as="form" onSubmit={handleAddAbsence} p={4}>
      <FormControl mb={3} isRequired>
        <FormLabel>Lesson Plan</FormLabel>
        <Input
          type="text"
          placeholder="Enter lesson plan"
          value={lessonPlan}
          onChange={(e) => setLessonPlan(e.target.value)}
          color="black"
        />
      </FormControl>
      <FormControl mb={3} isRequired>
        <FormLabel>Reason of Absence</FormLabel>
        <Input
          type="text"
          placeholder="Enter reason of absence"
          value={reasonOfAbsence}
          onChange={(e) => setReasonOfAbsence(e.target.value)}
          required
          color="black"
        />
      </FormControl>
      <FormControl mb={3} isRequired>
        <FormLabel>Absent Teacher ID</FormLabel>
        <Input
          type="number"
          placeholder="Enter absent teacher ID"
          value={absentTeacherId}
          onChange={(e) => setAbsentTeacherId(e.target.value)}
          required
          color="black"
        />
      </FormControl>
      <FormControl mb={3}>
        <FormLabel>Substitute Teacher ID</FormLabel>
        <Input
          type="number"
          placeholder="Enter substitute teacher ID"
          value={substituteTeacherId}
          onChange={(e) => setSubstituteTeacherId(e.target.value)}
          color="black"
        />
      </FormControl>
      <FormControl mb={3} isRequired>
        <FormLabel>Location ID</FormLabel>
        <Input
          type="number"
          placeholder="Enter location ID"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          required
          color="black"
        />
      </FormControl>
      <FormControl mb={3} isRequired>
        <FormLabel>Subject ID</FormLabel>
        <Input
          type="number"
          placeholder="Enter subject ID"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
          color="black"
        />
      </FormControl>
      {error && (
        <Text color="red.500" mt={2}>
          {error}
        </Text>
      )}
      <Button type="submit">Add Absence</Button>
    </Box>
  );
};

export default InputForm;
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
