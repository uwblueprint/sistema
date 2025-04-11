import { useToast } from '@chakra-ui/react';
import { EventInput } from '@fullcalendar/core';
import { AbsenceAPI, mapColorCodes } from '@utils/types';
import { useCallback, useEffect, useState } from 'react';

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
  absentTeacherDisplayName: absenceData.absentTeacher.firstName,
  absentTeacherFullName: `${absenceData.absentTeacher.firstName} ${absenceData.absentTeacher.lastName}`,
  substituteTeacherFullName: absenceData.substituteTeacher
    ? `${absenceData.substituteTeacher.firstName} ${absenceData.substituteTeacher.lastName}`
    : null,
  substituteTeacherDisplayName:
    absenceData.substituteTeacher?.firstName || null,
  subjectAbbreviation: absenceData.subject.abbreviation,
  locationAbbreviation: absenceData.location.abbreviation,
  colors: mapColorCodes(absenceData.subject.colorGroup.colorCodes),
  roomNumber: absenceData.roomNumber || null,
  lessonPlan: absenceData.lessonPlan || null,
  reasonOfAbsence: absenceData.reasonOfAbsence,
  notes: absenceData.notes,
  absenceId: absenceData.id,
});

export const useAbsences = (refetchUserData?: () => void) => {
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

      if (refetchUserData) {
        refetchUserData();
      }
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
  }, [refetchUserData, toast]);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  return { events, fetchAbsences };
};
