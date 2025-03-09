import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
  Textarea,
} from '@chakra-ui/react';
import { Absence, Prisma } from '@prisma/client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { FileUpload } from './FileUpload';
import { Dropdown } from './Dropdown';
import { SearchDropdown } from './SearchDropdown';
import { AbsenceAPI } from '@utils/types';

interface InputFormProps {
  onClose?: () => void;
  onAddAbsence: (
    absence: Prisma.AbsenceCreateManyInput
  ) => Promise<Absence | null>;
  onEditAbsence?: (
    absence: Prisma.AbsenceUpdateInput & { id: number }
  ) => Promise<Absence | null>;
  initialDate: Date;
  initialAbsence?: Partial<AbsenceAPI> | null;
  isEditMode?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  onClose,
  onAddAbsence,
  onEditAbsence,
  initialDate,
  initialAbsence = null,
  isEditMode = false,
}) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({
    userOptions: [],
    locationOptions: [],
    subjectOptions: [],
  });
  const [formData, setFormData] = useState({
    id: initialAbsence?.id || 0,
    reasonOfAbsence: initialAbsence?.reasonOfAbsence || '',
    absentTeacherId: initialAbsence?.absentTeacherId || '',
    substituteTeacherId: initialAbsence?.substituteTeacherId || '',
    locationId: initialAbsence?.location?.id || '',
    subjectId: initialAbsence?.subject?.id || '',
    lessonDate: initialAbsence?.lessonDate
      ? new Date(initialAbsence.lessonDate)
      : initialDate instanceof Date && !isNaN(initialDate.getTime())
        ? initialDate
        : new Date(),
    notes: initialAbsence?.notes || '',
  });
  const [lessonPlan, setLessonPlan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initialAbsenceRef = useRef(initialAbsence);

  const memoizedAbsentTeacher = useMemo(
    () => ({
      id: initialAbsence?.absentTeacherId || 0,
      name:
        initialAbsence?.absentTeacher?.firstName +
          ' ' +
          initialAbsence?.absentTeacher?.lastName || '',
    }),
    [
      initialAbsence?.absentTeacher?.firstName,
      initialAbsence?.absentTeacher?.lastName,
      initialAbsence?.absentTeacherId,
    ]
  );

  const memoizedSubstituteTeacher = useMemo(
    () => ({
      id: initialAbsence?.substituteTeacherId || 0,
      name:
        initialAbsence?.substituteTeacher?.firstName +
          ' ' +
          initialAbsence?.substituteTeacher?.lastName || '',
    }),
    [
      initialAbsence?.substituteTeacher?.firstName,
      initialAbsence?.substituteTeacher?.lastName,
      initialAbsence?.substituteTeacherId,
    ]
  );

  const memoizedSubject = useMemo(
    () => ({
      id: initialAbsence?.subject?.id || 0,
      name: initialAbsence?.subject?.name || '',
    }),
    [initialAbsence?.subject]
  );

  const memoizedLocation = useMemo(
    () => ({
      id: initialAbsence?.location?.id || 0,
      name: initialAbsence?.location?.name || '',
    }),
    [initialAbsence?.location]
  );

  // Fetch dropdown data only once when component mounts
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Check if we already have the data
        if (
          dropdownOptions.userOptions.length > 0 &&
          dropdownOptions.locationOptions.length > 0 &&
          dropdownOptions.subjectOptions.length > 0
        ) {
          return;
        }

        const res = await fetch('/api/formDropdown');
        if (res.ok) {
          const data = await res.json();
          setDropdownOptions(data);
        }
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, [
    dropdownOptions.userOptions.length,
    dropdownOptions.locationOptions.length,
    dropdownOptions.subjectOptions.length,
  ]);

  // Effect to populate form when in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      initialAbsence &&
      initialAbsence !== initialAbsenceRef.current
    ) {
      // Set form data in a single update to reduce re-renders
      setFormData({
        id: initialAbsence.id || 0,
        reasonOfAbsence: initialAbsence.reasonOfAbsence || '',
        absentTeacherId: initialAbsence.absentTeacherId
          ? String(initialAbsence.absentTeacherId)
          : '',
        substituteTeacherId: initialAbsence.substituteTeacherId
          ? String(initialAbsence.substituteTeacherId)
          : '',
        locationId: initialAbsence.location?.id
          ? String(initialAbsence.location?.id)
          : '',
        subjectId: initialAbsence.subject?.id
          ? String(initialAbsence.subject?.id)
          : '',
        lessonDate: initialAbsence.lessonDate
          ? new Date(initialAbsence.lessonDate)
          : initialDate,
        notes: initialAbsence.notes || '',
      });

      if (initialAbsence.lessonPlan) {
        setLessonPlan(initialAbsence.lessonPlan);
      }
      initialAbsenceRef.current = initialAbsence;
    }
  }, [isEditMode, initialAbsence, initialDate]);

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
    if (isEditMode && !formData.id) {
      newErrors.id = 'Absence ID is required for editing';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (url: string) => {
    setLessonPlan(url);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'lessonDate' && e.target.type === 'date') {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

    // Validate form fields
    const formErrors = validateForm();
    if (!formErrors) {
      setErrors({});
      return;
    }

    try {
      setIsSubmitting(true);
      const lessonDate = new Date(formData.lessonDate);
      lessonDate.setHours(lessonDate.getHours() + 12);

      if (isEditMode && onEditAbsence) {
        // Handle edit mode
        const updateData: Prisma.AbsenceUpdateInput & { id: number } = {
          id: Number(formData.id),
          lessonDate: lessonDate,
          lessonPlan: lessonPlan || null,
          reasonOfAbsence: formData.reasonOfAbsence,
          absentTeacherId: parseInt(String(formData.absentTeacherId), 10),
          substituteTeacherId: formData.substituteTeacherId
            ? parseInt(String(formData.substituteTeacherId), 10)
            : 0,
          locationId: parseInt(String(formData.locationId), 10),
          subjectId: parseInt(String(formData.subjectId), 10),
          notes: formData.notes,
        };

        const response = await onEditAbsence(updateData);

        if (response) {
          toast({
            title: 'Success',
            description: 'Absence has been successfully updated.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          if (onClose) {
            onClose();
          }
        }
      } else {
        // Handle add mode
        const absenceData: Prisma.AbsenceCreateManyInput = {
          lessonDate: lessonDate,
          lessonPlan: lessonPlan || null,
          reasonOfAbsence: formData.reasonOfAbsence,
          absentTeacherId: parseInt(String(formData.absentTeacherId), 10),
          substituteTeacherId: formData.substituteTeacherId
            ? parseInt(String(formData.substituteTeacherId), 10)
            : null,
          locationId: parseInt(String(formData.locationId), 10),
          subjectId: parseInt(String(formData.subjectId), 10),
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

          if (onClose) {
            onClose();
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to add/update absence',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent form submission when pressing Enter in inputs
  const preventDefaultFormSubmission = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      onKeyDown={preventDefaultFormSubmission}
      sx={{
        label: { fontSize: '14px', fontWeight: '400' },
      }}
    >
      <VStack sx={{ gap: '24px' }}>
        <FormControl isRequired isInvalid={!!errors.absentTeacherId}>
          <FormLabel sx={{ display: 'flex' }}>
            <Heading size="h4">Teacher Absent</Heading>
          </FormLabel>
          <SearchDropdown
            label="Teacher"
            type="user"
            excludedId={String(formData.substituteTeacherId)}
            initialValue={isEditMode ? memoizedAbsentTeacher : undefined}
            onChange={(value) => {
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
            options={dropdownOptions.userOptions}
          />
          <FormErrorMessage>{errors.absentTeacherId}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel sx={{ display: 'flex' }}>
            <Heading size="h4">Substitute Teacher</Heading>
          </FormLabel>
          <SearchDropdown
            label="Teacher"
            type="user"
            excludedId={String(formData.absentTeacherId)}
            initialValue={isEditMode ? memoizedSubstituteTeacher : undefined}
            onChange={(value) => {
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
            options={dropdownOptions.userOptions}
          />
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.subjectId}>
          <FormLabel sx={{ display: 'flex' }}>
            <Heading size="h4">Class Type</Heading>
          </FormLabel>
          <Dropdown
            label="class type"
            type="subject"
            initialValue={isEditMode ? memoizedSubject : undefined}
            onChange={(value) => {
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
            options={dropdownOptions.subjectOptions}
          />
          <FormErrorMessage>{errors.subjectId}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.locationId}>
          <FormLabel sx={{ display: 'flex' }}>
            <Heading size="h4">Location</Heading>
          </FormLabel>
          <Dropdown
            label="class location"
            type="location"
            initialValue={isEditMode ? memoizedLocation : undefined}
            onChange={(value) => {
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
            options={dropdownOptions.locationOptions}
          />
          <FormErrorMessage>{errors.locationId}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.lessonDate}>
          <FormLabel sx={{ display: 'flex' }}>
            <Heading size="h4">Date of Absence</Heading>
          </FormLabel>
          <Input
            name="lessonDate"
            fontSize="14px"
            value={
              formData.lessonDate instanceof Date
                ? formData.lessonDate.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
            }
            onChange={handleChange}
            type="date"
            color={formData.lessonDate ? 'black' : 'gray.500'}
          />
          <FormErrorMessage>{errors.lessonDate}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.reasonOfAbsence}>
          <FormLabel sx={{ display: 'flex' }}>
            <Heading size="h4">Reason of Absence</Heading>
          </FormLabel>
          <Input
            name="reasonOfAbsence"
            placeholder="Only visible to admin"
            fontSize="14px"
            value={formData.reasonOfAbsence}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.reasonOfAbsence}</FormErrorMessage>
        </FormControl>

        <FileUpload onFileUpload={handleFileUpload} />

        <FormControl>
          <FormLabel sx={{ display: 'flex' }}>
            <Heading size="h4">Notes</Heading>
          </FormLabel>
          <Textarea
            name="notes"
            placeholder="Additional relevant info..."
            fontSize="14px"
            value={formData.notes}
            onChange={handleChange}
            minH="88px"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText={isEditMode ? 'Updating' : 'Submitting'}
          width="full"
          height="44px"
        >
          {isEditMode ? 'Update Absence' : 'Declare Absence'}
        </Button>
      </VStack>
    </Box>
  );
};

export default InputForm;
