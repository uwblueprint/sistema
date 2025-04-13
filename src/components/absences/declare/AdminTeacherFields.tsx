import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { SearchDropdown } from '../../ui/input/SearchDropdown';

interface AdminTeacherFieldsProps {
  formData: {
    absentTeacherId: string;
    substituteTeacherId: string;
  };
  errors: Record<string, string>;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      absentTeacherId: string;
      substituteTeacherId: string;
      [key: string]: string;
    }>
  >;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const AdminTeacherFields: React.FC<AdminTeacherFieldsProps> = ({
  formData,
  errors,
  setFormData,
  setErrors,
}) => {
  return (
    <>
      <FormControl isRequired isInvalid={!!errors.absentTeacherId}>
        <FormLabel htmlFor="absentTeacher" sx={{ display: 'flex' }}>
          <Text textStyle="h4">Teacher Absent</Text>
        </FormLabel>
        <SearchDropdown
          id="absentTeacher"
          excludedId={formData.substituteTeacherId}
          defaultValueId={Number(formData.absentTeacherId)}
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              absentTeacherId: value ? String(value.id) : '',
            }));
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
        <FormLabel htmlFor="substituteTeacher" sx={{ display: 'flex' }}>
          <Text textStyle="h4">Substitute Teacher</Text>
        </FormLabel>
        <SearchDropdown
          id="substituteTeacher"
          excludedId={formData.absentTeacherId}
          defaultValueId={
            formData.substituteTeacherId
              ? Number(formData.substituteTeacherId)
              : undefined
          }
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              substituteTeacherId: value ? String(value.id) : '',
            }));
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
  );
};
