export interface Subject {
  id: number;
  name: string;
  abbrevation: string;
}

export interface FetchSubjectResponse {
  subjects: Subject[];
}
