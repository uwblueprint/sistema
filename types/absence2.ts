import { Location, Subject } from '@prisma/client';

export interface Absence {
  location: Location;
  subject: Subject;
  id: number;
  title: string;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  subjectId: number;
  locationId: number;
  newAbsence?: Omit<Absence, 'id'>;
}

export interface FetchAbsenceResponse {
  absences: Absence[];
}
