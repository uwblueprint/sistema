import { createSeedClient } from '@snaplet/seed';
import { faker } from '@faker-js/faker';

interface SeedClient {
  createSeedClient: (options?: boolean) => Promise<SeedClient>;
  $resetDatabase: (selectConfig?: boolean) => Promise<void>;
  user: (
    callback: (
      createMany: (count: number, factory: () => object) => void
    ) => void
  ) => Promise<void>;
  location: (
    callback: (
      createMany: (count: number, factory: () => object) => void
    ) => void
  ) => Promise<void>;
  absence: (
    callback: (
      createMany: (count: number, factory: () => object) => void
    ) => void
  ) => Promise<void>;
  mailingList: (
    callback: (
      createMany: (count: number, factory: () => object) => void
    ) => void
  ) => Promise<void>;
}

const main = async () => {
  const seed: SeedClient = await createSeedClient({
    connect: true,
  });

  await seed.$resetDatabase();

  await seed.user((createMany) =>
    createMany(5, () => ({
      authId: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: faker.helpers.arrayElement(['TEACHER', 'ADMIN']),
      status: faker.helpers.arrayElement(['ACTIVE', 'INVITED', 'DEACTIVATED']),
    }))
  );

  const generateAbbreviation = (schoolName: string): string => {
    const words = schoolName.split(' ');
    const abbreviation = words
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
    return abbreviation;
  };

  await seed.location((createMany) =>
    createMany(5, () => {
      const school = faker.helpers.arrayElement([
        'Lambton Park Community School',
        'St Martin de Porres Catholic School',
        'Yorkwoods Public School',
        'Parkdale Junior Senior Public School',
      ]);
      return {
        name: school,
        abbreviation: generateAbbreviation(school),
      };
    })
  );

  await seed.absence((createMany) =>
    createMany(10, () => ({
      lessonDate: faker.date.future(),
      subject: faker.helpers.arrayElement([
        'M_AND_M',
        'STRINGS',
        'CHOIR',
        'PERCUSSION',
      ]),
      lessonPlan: faker.internet.url(),
      reasonOfAbsence: faker.lorem.sentence(),
    }))
  );

  await seed.mailingList((createMany) =>
    createMany(10, () => ({
      name: faker.helpers.arrayElement([
        'M_AND_M',
        'STRINGS',
        'CHOIR',
        'PERCUSSION',
      ]),
      emails: [faker.internet.email(), faker.internet.email()],
    }))
  );

  console.log('Database seeded successfully!');

  process.exit();
};

main();
