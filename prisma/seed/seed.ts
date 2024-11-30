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

  enum StatusEnum {
    ACTIVE = 'ACTIVE',
    INVITED = 'INVITED',
    DEACTIVATED = 'DEACTIVATED',
  }

  const roles = [RoleEnum.TEACHER, RoleEnum.ADMIN];
  const statuses = [
    StatusEnum.ACTIVE,
    StatusEnum.INVITED,
    StatusEnum.DEACTIVATED,
  ];

  const numUsers = 5;
  const numMailingLists = 10;

  const userIds = Array.from({ length: numUsers }, (_, i) => i + 1);
  const mailingListIds = Array.from(
    { length: numMailingLists },
    (_, i) => i + 1
  );

  await seed.user((createMany) =>
    createMany(numUsers, () => ({
      authId: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: faker.helpers.arrayElement(roles),
      status: faker.helpers.arrayElement(statuses),
    }))
  );

  const schools = [
    { name: 'Lambton Park Community School', abbreviation: 'LP' },
    { name: 'St Martin de Porres Catholic School', abbreviation: 'SC' },
    { name: 'Yorkwoods Public School', abbreviation: 'YW' },
    { name: 'Parkdale Junior Senior Public School', abbreviation: 'PD' },
  ];

  await seed.location((createMany) =>
    createMany(5, () => {
      const school = faker.helpers.arrayElement(schools);
      return {
        name: school.name,
        abbreviation: school.abbreviation,
      };
    })
  );

  const subjects = [
    { name: 'Strings', abbreviation: 'STR', colorGroup: 'Coral' },
    { name: 'Music and Movement', abbreviation: 'M&M', colorGroup: 'Orange' },
    { name: 'Choir', abbreviation: 'CHO', colorGroup: 'Purple' },
    { name: 'Percussion', abbreviation: 'PER', colorGroup: 'Turquoise' },
  ];

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
    createMany(5, () => {
      const subject = faker.helpers.arrayElement(subjects);
      return {
        name: subject.name,
        abbreviation: subject.abbreviation,
        colorGroupId: colorGroups.find(
          (group) => group.name === subject.colorGroup
        )?.id,
      };
    })
  );

  const generateWeekdayFutureDate = (): Date => {
    let date: Date;
    do {
      date = faker.date.future();
    } while (date.getDay() === 0 || date.getDay() === 6);
    return date;
  };

  await seed.absence((createMany) =>
    createMany(10, () => {
      const maybeNotes = faker.helpers.maybe(() => faker.lorem.paragraph(), {
        probability: 0.5,
      });
      return {
        lessonDate: generateWeekdayFutureDate(),
        lessonPlan: faker.internet.url(),
        reasonOfAbsence: faker.lorem.sentence(),
        notes: maybeNotes ?? null,
      };
    })
  );

  await seed.mailingList((createMany) =>
    createMany(numMailingLists, () => {
      const subject = faker.helpers.arrayElement(subjects);
      return {
        name: subject.name,
      };
    })
  );

  for (const mailingListId of mailingListIds) {
    const randomUserIds = faker.helpers.arrayElements(userIds, 3);
    for (const userId of randomUserIds) {
      await seed.mailingListUser((createMany) =>
        createMany(1, () => ({
          mailingListId: mailingListId,
          userId: userId,
        }))
      );
    }
  }
  console.log('Database seeded successfully!');

  process.exit();
};

main();
