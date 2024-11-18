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

  await seed.user((createMany) =>
    createMany(5, () => ({
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
    { name: 'Strings', abbreviation: 'STR' },
    { name: 'Music and Movement', abbreviation: 'M&M' },
    { name: 'Choir', abbreviation: 'CHO' },
    { name: 'Percussion', abbreviation: 'PER' },
  ];

  await seed.subject((createMany) =>
    createMany(5, () => {
      const subject = faker.helpers.arrayElement(subjects);
      return {
        name: subject.name,
        abbreviation: subject.abbreviation,
      };
    })
  );

  await seed.absence((createMany) =>
    createMany(10, () => ({
      lessonDate: faker.date.future(),
      lessonPlan: faker.internet.url(),
      reasonOfAbsence: faker.lorem.sentence(),
    }))
  );

  await seed.mailingList((createMany) =>
    createMany(10, () => {
      const subject = faker.helpers.arrayElement(subjects);
      return {
        name: subject.name,
        emails: [faker.internet.email(), faker.internet.email()],
      };
    })
  );

  console.log('Database seeded successfully!');

  process.exit();
};

main();
