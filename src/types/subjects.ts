export interface Subject {
  id: number;
  name: string;
  abbrevation: string;
}

export interface SubjectResponse {
  locations: Subject[];
}
