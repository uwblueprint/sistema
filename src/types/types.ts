interface Absence {
  id: number;
  lessonDate: Date;
  lessonPlan?: string;
  reasonOfAbsence: string;
  notes?: string;
  absentTeacherId: number;
  substituteTeacherId?: number;
  locationId: number;
  subjectId: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  absences?: Absence[];
  substitutes?: Absence[];
  mailingLists?: UsersOnMailingLists[];
}

interface MailingList {
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
