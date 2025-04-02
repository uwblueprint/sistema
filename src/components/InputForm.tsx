import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';

import { Absence, Prisma } from '@prisma/client';
import { useState } from 'react';
import { DateOfAbsence } from './DateOfAbsence';
import { FileUpload } from './FileUpload';
import { InputDropdown } from './InputDropdown';
import { SearchDropdown } from './SearchDropdown';

interface InputFormProps {
  onClose?: () => void;
  onDeclareAbsence: (
    absence: Prisma.AbsenceCreateManyInput
  ) => Promise<Absence | null>;
  userId: number;
  onTabChange: (tab: 'explore' | 'declared') => void;
  initialDate: Date;
  isAdminMode: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  onClose,
  onDeclareAbsence,
  userId,
  onTabChange,
  initialDate,
  isAdminMode,
}) => {
  const toast = useToast();
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
      const lessonDate = new Date(formData.lessonDate + 'T00:00:00');

      let lessonPlanData: { url: string; name: string; size: number } | null =
        null;
      if (lessonPlan) {
        const lessonPlanUrl = await uploadFile(lessonPlan);

        if (lessonPlanUrl === null) {
          toast({
            title: 'Error',
            description: 'Failed to upload the lesson plan file',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        lessonPlanData = {
          url: lessonPlanUrl,
          name: lessonPlan.name,
          size: lessonPlan.size,
        };
      }

      const absenceData = {
        lessonDate: lessonDate,
        reasonOfAbsence: formData.reasonOfAbsence,
        absentTeacherId: parseInt(formData.absentTeacherId, 10),
        substituteTeacherId: formData.substituteTeacherId
          ? parseInt(formData.substituteTeacherId, 10)
          : null,
        locationId: parseInt(formData.locationId, 10),
        subjectId: parseInt(formData.subjectId, 10),
        notes: formData.notes,
        roomNumber: formData.roomNumber || null,
        lessonPlanFile: lessonPlanData,
      };

      const response = await onDeclareAbsence(absenceData);

      if (response) {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        };
        const formattedLessonDate = lessonDate.toLocaleDateString(
          'en-US',
          options
        );

        toast({
          title: 'Success',
          description: `You have successfully declared an absence on ${formattedLessonDate}.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        if (
          parseInt(formData.substituteTeacherId, 10) === userId ||
          parseInt(formData.absentTeacherId, 10) === userId
        ) {
          onTabChange('declared');
        }

        if (onClose) {
          onClose();
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to declare absence',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to declare absence',
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
          <>
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
          </>
        )}

        <FormControl isRequired isInvalid={!!errors.subjectId}>
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Subject</Text>
          </FormLabel>
          <InputDropdown
            label="class type"
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
            label="class location"
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
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Room Number</Text>
          </FormLabel>
          <Input
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
          <FormLabel sx={{ display: 'flex' }}>
            <Text textStyle="h4">Reason of Absence</Text>
          </FormLabel>
          <Textarea
            name="reasonOfAbsence"
            placeholder="Only visible to admin"
            value={formData.reasonOfAbsence}
            onChange={handleChange}
            minH="88px"
          />
          <FormErrorMessage>{errors.reasonOfAbsence}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>
            <Text textStyle="h4">Lesson Plan</Text>
          </FormLabel>
          <FileUpload lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} />
        </FormControl>

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
          isLoading={isSubmitting}
          loadingText="Submitting"
          width="full"
          height="44px"
        >
          Declare Absence
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Absence</ModalHeader>
          <ModalBody>
            <Text>
              Please confirm your absence on{' '}
              <strong>
                {new Date(formData.lessonDate + 'T00:00:00').toLocaleDateString(
                  'en-CA',
                  {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </strong>
              .
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal} mr={3}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} isLoading={isSubmitting}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InputForm;
