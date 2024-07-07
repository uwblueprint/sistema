import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Text,
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
  initialValues?: Event;
  onClose: () => void;
  onAddEvent?: (newEvent: Event) => void;
  onSaveEvent?: (updatedEvent: Event) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  initialDate,
  initialValues,
  onClose,
  onAddEvent,
  onSaveEvent,
}) => {
  const [subject, setSubject] = useState('');
  const [lessonPlan, setLessonPlan] = useState('');
  const [reasonOfAbsence, setReasonOfAbsence] = useState('');
  const [absentTeacherId, setAbsentTeacherId] = useState('');
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [locationId, setLocationId] = useState('');

  useEffect(() => {
    if (initialValues) {
      setSubject(initialValues.subject);
      setLessonPlan(initialValues.lessonPlan || '');
      setReasonOfAbsence(initialValues.reasonOfAbsence);
      setAbsentTeacherId(initialValues.absentTeacherId.toString());
      setSubstituteTeacherId(initialValues.substituteTeacherId?.toString() || '');
      setLocationId(initialValues.locationId.toString());
    }
  }, [initialValues]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData: Event = {
      id: initialValues?.id,
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
      if (initialValues?.id) {
        // Edit existing event
        const response = await fetch(`/api/absence`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
        

        if (response.ok) {
          const updatedEvent = await response.json();
          if (onSaveEvent) {
            onSaveEvent(updatedEvent);
          }
        } else {
          console.error('Failed to update event:', response.statusText);
        }
      } else {
        // Add new event
        const response = await fetch('/api/absence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const addedEvent = await response.json();
          if (onAddEvent) {
            onAddEvent(addedEvent);
          }
        } else {
          console.error('Failed to add event:', response.statusText);
          const errorResponse = await response.json();
          console.error('Error response:', response.status, errorResponse);
        }
      }

      // Reset form fields and close modal
      setSubject('');
      setLessonPlan('');
      setReasonOfAbsence('');
      setAbsentTeacherId('');
      setSubstituteTeacherId('');
      setLocationId('');
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Box as="form" onSubmit={handleFormSubmit} p={4}>
      <FormControl mb={3}>
        <FormLabel>
          Subject <Text as="span" color="red.500">*</Text>
        </FormLabel>
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
        <FormLabel>
          Reason of Absence <Text as="span" color="red.500">*</Text>
        </FormLabel>
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
        <FormLabel>
          Absent Teacher ID <Text as="span" color="red.500">*</Text>
        </FormLabel>
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
        <FormLabel>
          Location ID <Text as="span" color="red.500">*</Text>
        </FormLabel>
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
      <Button type="submit">{initialValues ? 'Update Event' : 'Save Event'}</Button>
    </Box>
  );
};

export default InputForm;
