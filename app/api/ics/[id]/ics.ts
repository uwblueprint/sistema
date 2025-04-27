import { AbsenceAPI } from '@utils/types';
import { EventAttributes, createEvents } from 'ics';

import { AbsenceAPI } from '@utils/types';
import { EventAttributes } from 'ics';

export const convertAbsenceToICSEvent = (
  absence: AbsenceAPI,
  calName: string
): EventAttributes => {
  const d = new Date(absence.lessonDate);

  const start: [number, number, number] = [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
  ];

  const substitutePart = absence.substituteTeacher
    ? ` → ${absence.substituteTeacher.firstName} ${absence.substituteTeacher.lastName.charAt(0)}`
    : '';
  const title =
    `(${absence.location.abbreviation}) ${absence.subject.name}: ` +
    `${absence.absentTeacher.firstName} ${absence.absentTeacher.lastName.charAt(0)}${substitutePart}`;

  const descLines = [
    `Subject: ${absence.subject.name}`,
    `Lesson Plan: ${absence.lessonPlan?.url ?? 'None'}`,
    absence.notes && `Notes: ${absence.notes}`,
    absence.reasonOfAbsence && `Reason: ${absence.reasonOfAbsence}`,
    absence.roomNumber && `Room: ${absence.roomNumber}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    start,
    startInputType: 'local',
    endInputType: 'local',
    duration: { days: 1 },

    title,
    description: descLines,
    location: absence.location.name,

    uid: `${absence.id}`,
    calName,
  };
};

export const createCalendarFile = (
  events: EventAttributes[]
): Promise<File> => {
  return new Promise((resolve, reject) => {
    createEvents(events, (error, value) => {
      if (error) {
        console.error('Error creating events:', error);
        reject(error);
      } else {
        resolve(new File([value], 'Absences.ics', { type: 'text/calendar' }));
      }
    });
  });
};
