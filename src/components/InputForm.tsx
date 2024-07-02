import { useState } from 'react';

interface Event {
  title: string;
  date: Date;
  lessonPlan: string;
  reasonOfAbsence: string;
  numberOfStudents: number;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  locationId: number;
}

interface InputFormProps {
  initialDate: Date;
  onClose: () => void;
  onAddEvent: (newEvent: Event) => void;
}

function InputForm({ initialDate, onClose, onAddEvent }: InputFormProps) {
  const [title, setTitle] = useState('');
  const [lessonPlan, setLessonPlan] = useState('');
  const [reasonOfAbsence, setReasonOfAbsence] = useState('');
  const [numberOfStudents, setNumberOfStudents] = useState(0);
  const [absentTeacherId, setAbsentTeacherId] = useState('');
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [locationId, setLocationId] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      title,
      date: initialDate,
      lessonPlan,
      reasonOfAbsence,
      numberOfStudents: parseInt(numberOfStudents.toString()),
      absentTeacherId: parseInt(absentTeacherId.toString()),
      substituteTeacherId: substituteTeacherId ? parseInt(substituteTeacherId.toString()) : null,
      locationId: parseInt(locationId.toString()),
    };
    onAddEvent(newEvent);
    setTitle('');
    setLessonPlan('');
    setReasonOfAbsence('');
    setNumberOfStudents(0);
    setAbsentTeacherId('');
    setSubstituteTeacherId('');
    setLocationId('');
  };

  return (
    <div className="form-container">
      <form onSubmit={handleAddEvent}>
        <input
          type="text"
          placeholder="Subject"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Lesson Plan"
          value={lessonPlan}
          onChange={(e) => setLessonPlan(e.target.value)}
        />
      
        <input
          type="text"
          placeholder="Reason of Absence"
          value={reasonOfAbsence}
          onChange={(e) => setReasonOfAbsence(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Number of Students"
          value={numberOfStudents}
          onChange={(e) => setNumberOfStudents(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Absent Teacher ID"
          value={absentTeacherId}
          onChange={(e) => setAbsentTeacherId(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Substitute Teacher ID"
          value={substituteTeacherId}
          onChange={(e) => setSubstituteTeacherId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Location ID"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          required
        />
          <button type="button">Upload Lesson Plan</button>
        <button type="submit">Add Event</button>
      </form>
    </div>
  );
}

export default InputForm;
