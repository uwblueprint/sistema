import { useState, useCallback, useEffect } from 'react';
import { EventInput } from '@fullcalendar/core';
import { useToast } from '@chakra-ui/react';
import { AbsenceAPI } from '@utils/types';

const convertAbsenceToEvent = (absenceData: AbsenceAPI): EventInput => ({
  title: absenceData.subject.name,
  start: absenceData.lessonDate,
  allDay: true,
  display: 'auto',

  location: absenceData.location.name,
  absentTeacher: absenceData.absentTeacher,
  substituteTeacher: absenceData.substituteTeacher,
  subjectId: absenceData.subject.id,
  locationId: absenceData.location.id,
  archivedLocation: absenceData.location.archived,
  archivedSubject: absenceData.subject.archived,
  absentTeacherFullName: `${absenceData.absentTeacher.firstName} ${absenceData.absentTeacher.lastName}`,
  roomNumber: absenceData.roomNumber || undefined,
  substituteTeacherFullName: absenceData.substituteTeacher
    ? `${absenceData.substituteTeacher.firstName} ${absenceData.substituteTeacher.lastName}`
    : undefined,
  lessonPlan: absenceData.lessonPlan,
  reasonOfAbsence: absenceData.reasonOfAbsence,
  notes: absenceData.notes,
});

export const useAbsences = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const toast = useToast();

  const fetchAbsences = useCallback(async () => {
    try {
      const res = await fetch('/api/getAbsences/');
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      const data = await res.json();
      const formattedEvents = data.events.map(convertAbsenceToEvent);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching absences:', error);
      toast({
        title: 'Failed to fetch absences',
        description:
          'There was an error loading the absence data. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  return { events, fetchAbsences };
};
