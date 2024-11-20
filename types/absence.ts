import { Absence, Subject, Location } from '@prisma/client';

export interface FetchAbsenceResponse {
  absences: (Absence & {
    subject: Subject;
    location: Location;
  })[];
}
