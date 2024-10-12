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
