import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
} from '@chakra-ui/react';

interface Event {
  id?: number;
  subject: string;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  locationId: number;
}

interface InputFormProps {
  initialDate: Date;
  onClose: () => void;
  onAddEvent: (newEvent: Event) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  initialDate,
  onClose,
  onAddEvent,
}) => {
  const [subject, setSubject] = useState('');
  const [lessonPlan, setLessonPlan] = useState('');
  const [reasonOfAbsence, setReasonOfAbsence] = useState('');
  const [absentTeacherId, setAbsentTeacherId] = useState('');
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [locationId, setLocationId] = useState('');

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      subject,
      lessonDate: initialDate,
      lessonPlan: lessonPlan || null,
      reasonOfAbsence,
      absentTeacherId: parseInt(absentTeacherId, 10),
      substituteTeacherId: substituteTeacherId
        ? parseInt(substituteTeacherId, 10)
        : null,
      locationId: parseInt(locationId, 10),
    };

    try {
      const response = await fetch('/api/absence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        const addedEvent = await response.json();
        onAddEvent(addedEvent);
        setSubject('');
        setLessonPlan('');
        setReasonOfAbsence('');
        setAbsentTeacherId('');
        setSubstituteTeacherId('');
        setLocationId('');
        onClose();
      } else {
        console.error('Failed to add event:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <Box as="form" onSubmit={handleAddEvent} p={4}>
      <FormControl mb={3}>
        <FormLabel>Subject</FormLabel>
        <Select
          placeholder="Select subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          color="black"
        >
          <option value="M_AND_M">M_AND_M</option>
          <option value="STRINGS">STRINGS</option>
          <option value="CHOIR">CHOIR</option>
          <option value="PERCUSSION">PERCUSSION</option>
        </Select>
      </FormControl>
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
        <FormHelperText>
          Enter the ID of the location for the event.
        </FormHelperText>
      </FormControl>
      <Button type="submit">Add Event</Button>
    </Box>
  );
};

export default InputForm;
