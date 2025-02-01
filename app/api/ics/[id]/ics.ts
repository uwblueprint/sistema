import { EventAttributes, createEvents } from 'ics';
import {
  AbsenceWithRelations,
  searchAbsences,
} from '../../getAbsences/absences';

export const getAbsenceEvents = async (): Promise<EventAttributes[]> => {
  try {
    const absences = await searchAbsences();

    return absences.map((absence: AbsenceWithRelations) => {
      const substituteTeacherString = absence.substituteTeacher
        ? `(${absence.substituteTeacher.firstName} ${absence.substituteTeacher.lastName[0]})`
        : '';
      const lessonString = absence.lessonPlan || 'Lesson Plan Not Submitted';
      const notesLine = absence.notes ? `\nNotes: ${absence.notes}` : '';

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
        description: `Subject: ${absence.subject.name}\nLesson Plan: ${lessonString}${notesLine}`,
        location: absence.location.name,
      };
    });
  } catch (err) {
    console.error('Error fetching absences:', err);
    throw err;
  }
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
