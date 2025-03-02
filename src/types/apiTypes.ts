export interface ColorGroup {
  id: number;
  name: string;
  colorCodes: string[];
}

export interface Subject {
  id: number;
  name: string;
  abbreviation: string;
  colorGroup: ColorGroup;
}

export interface MailingList {
  subject: {
    id: number;
    name: string;
    abbreviation?: string;
    colorGroup: {
      colorCodes: string[];
    };
  };
}

export interface Absence {
  id: number;
  lessonDate: string;
  reasonOfAbsence: string;
  // Add other absence properties as needed
}

export enum Role {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export interface UserAPI {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: Role;
  absences: Absence[];
  mailingLists: MailingList[];
}
