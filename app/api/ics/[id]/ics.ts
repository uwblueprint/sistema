import { EventAttributes, createEvents } from 'ics';
import { AbsenceWithRelations } from '../../getAbsences/absences';

const CALENDAR_NAME: string = 'Sistema Absences';

export const convertAbsenceToICSEvent = (
  absence: AbsenceWithRelations
): EventAttributes => {
  const substituteTeacherString = absence.substituteTeacher
    ? `(${absence.substituteTeacher.firstName} ${absence.substituteTeacher.lastName[0]})`
    : '';
  const lessonString = absence.lessonPlan || 'Lesson Plan Not Submitted';
  const notesLine = absence.notes ? `\nNotes: ${absence.notes}` : '';
  const roomString = absence.roomNumber ? `\nRoom: ${absence.roomNumber}` : '';

  const startDate = new Date(absence.lessonDate);
  const endDate = new Date(absence.lessonDate);
  endDate.setDate(startDate.getDate() + 1);

  return {
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
    ],
    end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()],
    title: `${absence.subject.name}: ${absence.absentTeacher.firstName} ${absence.absentTeacher.lastName[0]}${substituteTeacherString}`,
    description: `Subject: ${absence.subject.name}\nLesson Plan: ${lessonString}${notesLine}${roomString}`,
    location: absence.location.name,
    calName: CALENDAR_NAME,
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
