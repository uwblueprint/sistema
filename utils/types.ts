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

export interface EventDetails {
  title: string;
  start: Date | null;
  absentTeacher: { id: number; firstName: string; lastName: string } | null;
  absentTeacherFullName: string;
  substituteTeacher: { id: number; firstName: string; lastName: string } | null;
  substituteTeacherFullName: string | null;
  location: string;
  classType: string;
  lessonPlan: string | null;
  roomNumber: string | null;
  reasonOfAbsence: string;
  notes: string;
  absenceId: number;
}

export interface AbsenceAPI {
  id: number;
  lessonDate: Date;
  lessonPlan?: string | null;
  reasonOfAbsence: string;
  notes?: string | null;
  roomNumber?: string | null;
  absentTeacher: {
    id: number;
    firstName: string;
    lastName: string;
  };
  substituteTeacher?: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  location: {
    id: number;
    name: string;
    abbreviation: string;
    archived: boolean;
  };
  subject: {
    id: number;
    name: string;
    archived: boolean;
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
}

export interface UserAPI {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
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
  archived: boolean;
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
  archived: boolean;
  abbreviation: string;
  colorGroupId: number;
}

export interface SubjectAPI {
  id: number;
  name: string;
  abbreviation: string;
  colorGroupId: number;
  archived: boolean;
  colorGroup: {
    name: string;
    colorCodes: string[];
  };
}

export interface ColorGroup {
  id: number;
  name: string;
  colorCodes: string[];
}

export interface ColorCodes {
  light: string;
  medium: string;
  dark: string;
  text: string;
}

export function mapColorCodes(codesArr): ColorCodes {
  let coded: ColorCodes = {
    light: codesArr[3],
    medium: codesArr[2],
    dark: codesArr[1],
    text: codesArr[0],
  };
  return coded;
}

export interface GlobalSettings {
  id: number;
  absenceCap: number;
}

export enum Role {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  image?: string;
  usedAbsences: number;
  role: Role;
}

export interface MonthlyAbsenceData {
  month: string;
  filled: number;
  unfilled: number;
}

export interface YearlyAbsenceData {
  yearRange: string;
  yearlyData: MonthlyAbsenceData[];
}

export type ComparisonOperator = 'greater_than' | 'less_than' | 'equal_to';

export interface FilterOptions {
  role: string | null | undefined;
  absencesOperator: ComparisonOperator;
  absencesValue: number | null;
  tags: string[] | null;
}
