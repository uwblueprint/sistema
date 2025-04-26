import { getUTCDateMidnight } from '@utils/dates';
import { AbsenceAPI } from '@utils/types';
import { EventAttributes, createEvents } from 'ics';

export const convertAbsenceToICSEvent = (
  absence: AbsenceAPI,
  calName: string
): EventAttributes => {
  const substituteTeacherString = absence.substituteTeacher
    ? `(${absence.substituteTeacher.firstName} ${absence.substituteTeacher.lastName[0]})`
    : '';
  const lessonString = absence.lessonPlan?.url || 'Lesson Plan Not Submitted';
  const notesLine = absence.notes ? `\nNotes: ${absence.notes}` : '';
  const roomString = absence.roomNumber ? `\nRoom: ${absence.roomNumber}` : '';
  const startUTC = getUTCDateMidnight(new Date(absence.lessonDate), 0);
  const endUTC = getUTCDateMidnight(new Date(absence.lessonDate), 1);

  return {
    start: [
      startUTC.getUTCFullYear(),
      startUTC.getUTCMonth() + 1,
      startUTC.getUTCDate(),
    ],
    end: [
      endUTC.getUTCFullYear(),
      endUTC.getUTCMonth() + 1,
      endUTC.getUTCDate(),
    ],
    title: `${absence.location.abbreviation}: ${absence.subject.name}: ${absence.absentTeacher.firstName} ${absence.absentTeacher.lastName[0]} ${substituteTeacherString}`,
    description: `Subject: ${absence.subject.name}\nLesson Plan: ${lessonString}${notesLine}${roomString}`,
    location: absence.location.name,
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
