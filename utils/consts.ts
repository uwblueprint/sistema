export const NEXT_PUBLIC_PROD_URL = process.env.NEXT_PUBLIC_PROD_URL!;
export const MAX_SUBJECT_ABBREVIATION_LENGTH = 9;
export const MAX_LOCATION_ABBREVIATION_LENGTH = 12;
export const COLOR_GROUPS = [
  {
    id: 1,
    name: 'Coral',
    colorCodes: ['#8B2321', '#F06E6B', '#FFBFBD', '#FFEBEB'],
  },
  {
    id: 2,
    name: 'Orange',
    colorCodes: ['#7E3E02', '#F7A75C', '#FBD38D', '#FEEED5'],
  },
  {
    id: 3,
    name: 'Purple',
    colorCodes: ['#5F2D66', '#9F65A8', '#D2AED8', '#EED5F2'],
  },
  {
    id: 4,
    name: 'Turquoise',
    colorCodes: ['#0D5A53', '#25BAAB', '#81E6D9', '#D5F6F3'],
  },
  {
    id: 5,
    name: 'Blue',
    colorCodes: ['#263C71', '#6592FF', '#A7C1FF', '#D9E4FF'],
  },
  {
    id: 6,
    name: 'Yellow',
    colorCodes: ['#615219', '#F9DC5C', '#FCEFB4', '#FDF8E1'],
  },
  {
    id: 7,
    name: 'Orchid',
    colorCodes: ['#3D324F', '#615574', '#AEA2C3', '#D8CCED'],
  },
  {
    id: 8,
    name: 'Green',
    colorCodes: ['#2D4F12', '#79A854', '#C0E3A4', '#DDFBDD'],
  },
];

export const SUBJECTS = [
  { name: 'Strings', abbreviation: 'STR', colorGroupId: 3 },
  { name: 'Choir', abbreviation: 'CHO', colorGroupId: 2 },
  {
    name: 'Music & Movement',
    abbreviation: 'M&M',
    colorGroupId: 4,
  },
  { name: 'Percussion', abbreviation: 'PER', colorGroupId: 7 },
  { name: 'Trumpet/Clarinets', abbreviation: 'T&C', colorGroupId: 1 },
];

export const SCHOOLS = [
  { name: 'Lambton Park Community School', abbreviation: 'Lambton' },
  { name: 'St Martin de Porres Catholic School', abbreviation: 'St Martin' },
  { name: 'Yorkwoods Public School', abbreviation: 'Yorkwoods' },
  { name: 'Parkdale Junior Senior Public School', abbreviation: 'Parkdale' },
];

export const ROOM_NUMBERS = ['101', '202', '303', '404', 'B1', 'A5', 'C12'];
