//@ts-nocheck

import { createSeedClient } from '@snaplet/seed';
import { faker } from '@faker-js/faker';

const main = async () => {
  const seed = await createSeedClient({
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

  const generateSchoolNameAbbreviation = (schoolName: string): string => {
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
        abbreviation: generateSchoolNameAbbreviation(school),
      };
    })
  );

  const generateSubjectAbbreviation = (subjectName: string): string => {
    const words = subjectName.split('_');
    const abbreviation = words
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
    return abbreviation;
  };

  await seed.subject((createMany) =>
    createMany(5, () => {
      const subject = faker.helpers.arrayElement([
        'STRINGS',
        'M_AND_M',
        'CHOIR',
        'PERCUSSION',
      ]);
      return {
        name: subject,
        abbreviation: generateSubjectAbbreviation(subject),
      };
    })
  );

  // await seed.absence((createMany) =>
  //   createMany(10, () => ({
  //     lessonDate: faker.date.future(),
  //     // lessonPlan: faker.internet.url(),
  //     lessonPlan: Math.random() > 0.5 ? faker.internet.url() : null, // Randomly assign null or a URL
  //     reasonOfAbsence: faker.lorem.sentence(),
  //   }))
  // );

  const today = new Date();
  const twoDaysFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 2
  );
  const sevenDaysFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 7
  );

  await seed.absence((createMany) =>
    createMany(10, (index) => ({
      lessonDate: index % 2 === 0 ? twoDaysFromToday : sevenDaysFromToday, // Alternate between 2 and 7 days from today
      lessonPlan: Math.random() > 0.5 ? faker.internet.url() : null, // Randomly assign null or a URL
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
