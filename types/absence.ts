export interface AbsenceWithRelations {
  id: number;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  notes: string | null;
  absentTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  };
  substituteTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  location: {
    name: string;
    abbreviation: string;
  };
  subject: {
    name: string;
    abbreviation: string;
  };
}
