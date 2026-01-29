import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
} from '@chakra-ui/react';
import { useId } from 'react';
import { SearchDropdown } from './SearchDropdown';

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
  const id = useId();

  return (
    <>
      <FormControl isRequired isInvalid={!!errors.absentTeacherId}>
        <FormLabel
          id={'absentTeacherLabel' + id}
          as="p"
          sx={{ display: 'flex' }}
        >
          <Text textStyle="h4">Teacher Absent</Text>
        </FormLabel>
        <SearchDropdown
          id="absentTeacher"
          ariaLabelledBy={'absentTeacherLabel' + id}
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
        <FormLabel
          id={'substituteTeacherLabel' + id}
          as="p"
          sx={{ display: 'flex' }}
        >
          <Text textStyle="h4">Substitute Teacher</Text>
        </FormLabel>
        <SearchDropdown
          id="substituteTeacher"
          ariaLabelledBy={'substituteTeacherLabel' + id}
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
