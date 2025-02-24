export interface Absence {
  id: number;
  lessonDate: Date;
  lessonPlan?: string | null;
  reasonOfAbsence: string;
  notes?: string | null;
  roomNumber?: string | null;
  absentTeacherId: number;
  substituteTeacherId?: number | null;
  locationId: number;
  subjectId: number;
}

export interface AbsenceWithRelations {
  id: number;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  notes: string | null;
  roomNumber: string | null;
  absentTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  };
  substituteTeacher?: {
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
    colorGroup: {
      name: string;
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
  absences?: Absence[];
  substitutes?: Absence[];
  mailingLists?: UsersOnMailingLists[];
}

export interface MailingList {
  id: number;
  name: string;
  emails: string[];
  users?: UsersOnMailingLists[];
}

export interface UsersOnMailingLists {
  user: User;
  userId: number;
  mailingList: MailingList;
  mailingListId: number;
}

export interface Subject {
  id: number;
  name: string;
  abbreviation: string;
  colorGroupId: number;
  colorGroup: ColorGroup;
}

export interface ColorGroup {
  id: number;
  name: string;
  colorCodes: string[];
}

export interface Location {
  id: number;
  name: string;
  abbreviation: string;
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
