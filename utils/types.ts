export interface Absence {
  id: number;
  lessonDate: Date;
  lessonPlan?: string;
  reasonOfAbsence: string;
  notes?: string;
  roomNumber?: string;
  absentTeacherId: number;
  substituteTeacherId?: number;
  locationId: number;
  subjectId: number;
}

export interface AbsenceAPI {
  lessonDate: Date;
  lessonPlan?: string | null;
  reasonOfAbsence: string;
  notes?: string | null;
  roomNumber?: string | null;
  absentTeacher: {
    firstName: string;
    lastName: string;
  };
  substituteTeacher?: {
    firstName: string;
    lastName: string;
  } | null;
  location: {
    name: string;
  };
  subject: {
    name: string;
    abbreviation: string;
    colorGroup: {
      colorCodes: string[];
    };
  };
}

export interface User {
  id: number;
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: Status;
}

export interface UserAPI {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  absences: { id: number }[];
  mailingLists: {
    subject: {
      name: string;
      colorGroup: {
        colorCodes: string[];
      };
    };
  }[];
}

export interface Location {
  id: number;
  name: string;
  abbreviation: string;
}

export interface MailingListWithRelations {
  userId: number;
  subjectId: number;
  user: User;
  subject: Subject;
}

export interface Subject {
  id: number;
  name: string;
  abbreviation: string;
  colorGroupId: number;
}

export interface SubjectWithRelations {
  id: number;
  name: string;
  abbreviation: string;
  colorGroupId: number;
}

export interface ColorGroup {
  id: number;
  name: string;
  colorCodes: string[];
}

export interface GlobalSettings {
  id: number;
  absenceCap: number;
}

export enum Role {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  DEACTIVATED = 'DEACTIVATED',
}
