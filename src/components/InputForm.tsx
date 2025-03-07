import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Textarea,
} from '@chakra-ui/react';
import { Absence, Prisma } from '@prisma/client';
import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { InputDropdown } from './InputDropdown';
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
    roomNumber: '',
    lessonDate: initialDate.toLocaleDateString('en-CA'),
    notes: '',
  });
  const [lessonPlan, setLessonPlan] = useState<File | null>(null);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

      let lessonPlanUrl: string | null = null;
      if (lessonPlan) {
        lessonPlanUrl = await uploadFile(lessonPlan);
      }

      const absenceData: Prisma.AbsenceCreateManyInput = {
        lessonDate: lessonDate,
        lessonPlan: lessonPlanUrl,
        reasonOfAbsence: formData.reasonOfAbsence,
        absentTeacherId: parseInt(formData.absentTeacherId, 10),
        substituteTeacherId: formData.substituteTeacherId
          ? parseInt(formData.substituteTeacherId, 10)
          : null,
        locationId: parseInt(formData.locationId, 10),
        subjectId: parseInt(formData.subjectId, 10),
        notes: formData.notes,
        roomNumber: formData.roomNumber || null,
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

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    const res = await fetch('/api/uploadFile/', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to upload file');
    }

    const data = await res.json();
    return `https://drive.google.com/file/d/${data.fileId}/view`;
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
        <FormControl isRequired isInvalid={!!errors.absentTeacherId}>
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Teacher Absent</Text>
          </FormLabel>
          <SearchDropdown
            label="Teacher"
            type="user"
            excludedId={formData.substituteTeacherId}
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
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Substitute Teacher</Text>
          </FormLabel>
          <SearchDropdown
            label="Teacher"
            type="user"
            excludedId={formData.absentTeacherId}
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
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Subject</Text>
          </FormLabel>
          <InputDropdown
            label="subject"
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
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Location</Text>
          </FormLabel>
          <InputDropdown
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
        <FormControl>
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Room Number</Text>
          </FormLabel>
          <Input
            name="roomNumber"
            placeholder="Enter room number"
            value={formData.roomNumber}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl isRequired isInvalid={!!errors.lessonDate}>
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Date of Absence</Text>
          </FormLabel>
          <Input
            name="lessonDate"
            value={formData.lessonDate}
            onChange={handleChange}
            type="date"
            color={formData.lessonDate ? 'black' : 'gray.500'}
          />
          <FormErrorMessage>{errors.lessonDate}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.reasonOfAbsence}>
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Reason of Absence</Text>
          </FormLabel>
          <Input
            name="reasonOfAbsence"
            placeholder="Only visible to admin"
            value={formData.reasonOfAbsence}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.reasonOfAbsence}</FormErrorMessage>
        </FormControl>

        <FileUpload lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} />

        <FormControl>
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Notes</Text>
          </FormLabel>
          <Textarea
            name="notes"
            placeholder="Additional relevant info..."
            value={formData.notes}
            onChange={handleChange}
            minH="88px"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText="Submitting"
          width="full"
          height="44px"
        >
          Declare Absence
        </Button>
      </VStack>
    </Box>
  );
};

export default InputForm;
