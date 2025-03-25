//@ts-nocheck

import { faker } from '@faker-js/faker';
import { createSeedClient } from '@snaplet/seed';

const main = async () => {
  const seed = await createSeedClient({
    connect: true,
  });

  await seed.$resetDatabase();

  enum RoleEnum {
    TEACHER = 'TEACHER',
    ADMIN = 'ADMIN',
  }

  const roles = [RoleEnum.TEACHER, RoleEnum.ADMIN];

  const subjects = [
    { name: 'Strings', abbreviation: 'STR', colorGroupId: 3 },
    { name: 'Choir', abbreviation: 'CHO', colorGroupId: 2 },
    {
      name: 'Music & Movement',
      abbreviation: 'M&M',
      colorGroupId: 4,
    },
    { name: 'Percussion', abbreviation: 'PER', colorGroupId: 7 },
    { name: 'Trumpet/Clarinets', abbreviation: 'T&C', colorGroupId: 1 },
    {
      name: 'Harpsichord',
      abbreviation: 'HPS',
      colorGroupId: 5,
      archived: true,
    },
  ];

  const numUsers = 20;
  const numAbsences = 100;
  const numSubjects = subjects.length;
  const userIds = Array.from({ length: numUsers }, (_, i) => i + 1);
  const subjectIds = Array.from({ length: numSubjects }, (_, i) => i + 1);

  const users = await seed.user((createMany) =>
    createMany(numUsers, () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return {
        authId: faker.string.uuid(),
        email: faker.internet.email({ firstName, lastName }),
        firstName: firstName,
        lastName: lastName,
        profilePicture: `https://robohash.org/${faker.string.uuid()}?set=set5`,
        role: faker.helpers.arrayElement(roles),
      };
    })
  );

  const schools = [
    { name: 'Lambton Park Community School', abbreviation: 'LP' },
    { name: 'St Martin de Porres Catholic School', abbreviation: 'SC' },
    { name: 'Yorkwoods Public School', abbreviation: 'YW' },
    { name: 'Parkdale Junior Senior Public School', abbreviation: 'PD' },
    {
      name: 'St Gertrude Elementary School',
      abbreviation: 'SG',
      archived: true,
    },
  ];

  for (const school of schools) {
    await seed.location((createMany) =>
      createMany(1, () => ({
        name: school.name,
        abbreviation: school.abbreviation,
        archived: school.archived,
      }))
    );
  }

  const colorGroups = [
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

  for (const colorGroup of colorGroups) {
    await seed.colorGroup((createMany) =>
      createMany(1, () => ({
        name: colorGroup.name,
        colorCodes: colorGroup.colorCodes,
      }))
    );
  }

  await seed.subject((createMany) =>
    createMany(numSubjects, (curSubject) => ({
      name: subjects[curSubject.index].name,
      abbreviation: subjects[curSubject.index].abbreviation,
      colorGroupId: subjects[curSubject.index].colorGroupId,
      archived: subjects[curSubject.index].archived,
    }))
  );

  const generateWeekdayFutureDate = (): Date => {
    let date: Date;
    do {
      date = faker.date.future();
    } while (date.getDay() === 0 || date.getDay() === 6);
    return date;
  };

  await seed.absence((createMany) =>
    createMany(numAbsences, () => {
      const maybeNotes = faker.helpers.maybe(() => faker.lorem.paragraph(), {
        probability: 0.5,
      });
      return {
        lessonDate: generateWeekdayFutureDate(),
        lessonPlan: faker.internet.url(),
        reasonOfAbsence: faker.lorem.sentence(),
        notes: maybeNotes ?? null,
        roomNumber: faker.helpers.arrayElement([
          '101',
          '202',
          '303',
          '404',
          'B1',
          'A5',
          'C12',
        ]),
      };
    })
  );

  for (const subjectId of subjectIds) {
    const randomNumUsers = faker.number.int({ min: 0, max: numUsers });
    const randomUserIds = faker.helpers.arrayElements(userIds, randomNumUsers);

    for (const userId of randomUserIds) {
      await seed.mailingList((createMany) =>
        createMany(1, () => ({
          userId: userId,
          subjectId: subjectId,
        }))
      );
    }
  }

  await seed.globalSettings((createMany) =>
    createMany(1, () => ({
      absenceCap: 10,
    }))
  );

  console.log('Database seeded successfully!');

  process.exit();
};

main();
