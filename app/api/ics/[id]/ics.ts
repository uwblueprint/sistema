import { getUTCDateWithoutTime } from '@utils/dates';
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

  const startDate = new Date(absence.lessonDate);
  const endDate = new Date(absence.lessonDate);
  endDate.setDate(startDate.getDate() + 1);

  const d0 = getUTCDateWithoutTime(new Date(absence.lessonDate), 0);
  const d1 = getUTCDateWithoutTime(new Date(absence.lessonDate), 1);
  return {
    start: [d0.getUTCFullYear(), d0.getUTCMonth() + 1, d0.getUTCDate()],
    end: [d1.getUTCFullYear(), d1.getUTCMonth() + 1, d1.getUTCDate()],
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
