export interface Absence {
  id: number;
  title: string;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  subject: {
    abbreviation: string;
    id: number;
    name: string;
  };
  location: {
    abbreviation: string;
    id: number;
    name: string;
  };
  subjectId: 2;
  locationId: number;
  newAbsence?: Omit<Absence, 'id'>;
}

export interface FetchAbsenceResponse {
  absences: Absence[];
}
