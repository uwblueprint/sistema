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
  initialAbsence?: Absence | null;
  onClose: () => void;
  onAddAbsence: (newAbsence: Absence) => Promise<Absence | null>;
}

const InputForm: React.FC<InputFormProps> = ({
  initialDate,
  initialAbsence = null,
  onClose,
  onAddAbsence,
}) => {
  const [lessonPlan, setLessonPlan] = useState(
    initialAbsence?.lessonPlan || ''
  );
  const [reasonOfAbsence, setReasonOfAbsence] = useState(
    initialAbsence?.reasonOfAbsence || ''
  );
  const [absentTeacherId, setAbsentTeacherId] = useState(
    initialAbsence?.absentTeacherId.toString() || ''
  );
  const [substituteTeacherId, setSubstituteTeacherId] = useState(
    initialAbsence?.substituteTeacherId?.toString() || ''
  );
  const [locationId, setLocationId] = useState(
    initialAbsence?.locationId.toString() || ''
  );
  const [subjectId, setSubjectId] = useState(
    initialAbsence?.subjectId.toString() || ''
  );
  const [error, setError] = useState('');

  const handleAddAbsence = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newAbsence: Absence = {
        id: initialAbsence?.id,
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

      const success = await onAddAbsence(newAbsence);

      if (success) {
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
      setError(err.toString());
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
      <Button type="submit">
        {initialAbsence ? 'Update Absence' : 'Add Absence'}
      </Button>
    </Box>
  );
};

export default InputForm;
