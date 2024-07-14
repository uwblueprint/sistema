import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
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
  onAddAbsence: (newAbsence: Absence) => void;
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

  const handleAddAbsence = async (e: React.FormEvent) => {
    console.log("Input form")
    e.preventDefault();
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
        onAddAbsence(newAbsence);
        setLessonPlan('');
        setReasonOfAbsence('');
        setAbsentTeacherId('');
        setSubstituteTeacherId('');
        setLocationId('');
        setSubjectId('');
        onClose();
  };

  return (
    <Box as="form" onSubmit={handleAddAbsence} p={4}>
      <FormControl mb={3}>
        <FormLabel>Lesson Plan</FormLabel>
        <Input
          type="text"
          placeholder="Enter lesson plan"
          value={lessonPlan}
          onChange={(e) => setLessonPlan(e.target.value)}
          color="black"
        />
      </FormControl>
      <FormControl mb={3}>
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
      <FormControl mb={3}>
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
      <FormControl mb={3}>
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
      <FormControl mb={3}>
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
      <Button type="submit">Add Absence</Button>
    </Box>
  );
};

export default InputForm;
