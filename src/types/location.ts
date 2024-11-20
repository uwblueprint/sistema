export interface Location {
  id: number;
  name: string;
  abbrevation: string;
}

export interface locationResponse {
  locations: Location[];
}
