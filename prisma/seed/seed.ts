//@ts-nocheck

import { faker } from '@faker-js/faker';
import { createSeedClient } from '@snaplet/seed';
import { COLOR_GROUPS, ROOM_NUMBERS, SCHOOLS, SUBJECTS } from '@utils/consts';
import { Role } from '@utils/types';

const ensureSafeDatabase = () => {
  const databaseUrl =
    process.env.DATABASE_URL || process.env.DATABASE_URL_DOCKER;

  if (!databaseUrl) {
    throw new Error(
      'Seeding aborted: DATABASE_URL (or DATABASE_URL_DOCKER) is not set, so the target database cannot be verified.'
    );
  }

  let hostname: string | undefined;

  try {
    const parsedUrl = new URL(databaseUrl);

    if (parsedUrl.protocol === 'file:') {
      return;
    }

    hostname = parsedUrl.hostname;
  } catch {
    throw new Error(
      'Seeding aborted: the provided DATABASE_URL could not be parsed, so the environment could not be verified.'
    );
  }

  const safeHosts = new Set([
    'localhost',
    '127.0.0.1',
    'db',
    'host.docker.internal',
  ]);

  if (!hostname || !safeHosts.has(hostname)) {
    throw new Error(
      `Seeding aborted: refusing to reset database at host "${hostname ?? 'unknown'}".`
    );
  }
};

const main = async () => {
  ensureSafeDatabase();

  const seed = await createSeedClient({
    connect: true,
  });

  await seed.$resetDatabase();

  const numUsers = 100;
  const numAbsences = 600;
  const numSubjects = SUBJECTS.length;
  const userIds = Array.from({ length: numUsers + 1 }, (_, i) => i + 1);
  const subjectIds = Array.from({ length: numSubjects }, (_, i) => i + 1);
  const absenceIds = Array.from({ length: numAbsences }, (_, i) => i + 1);

  await seed.user((createMany) =>
    createMany(1, () => {
      return {
        authId: faker.string.uuid(),
        email: 'sistema@uwblueprint.org',
        firstName: 'Sistema',
        lastName: 'Blueprint',
        profilePicture: `https://lh3.googleusercontent.com/a/ACg8ocKxepJIC2yHao12N7K58_vzFKhY4GLrzOzpLKhBJRC14k2E_Q=s96-c`,
        role: Role.ADMIN,
      };
    })
  );

  await seed.user((createMany) =>
    createMany(numUsers, () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return {
        authId: faker.string.uuid(),
        email: faker.internet.email({ firstName, lastName }),
        firstName: firstName,
        lastName: lastName,
        profilePicture: `https://i.pravatar.cc/50?u=${faker.string.uuid()}`,
        role: Role.TEACHER,
      };
    })
  );

  for (const school of SCHOOLS) {
    await seed.location((createMany) =>
      createMany(1, () => ({
        name: school.name,
        abbreviation: school.abbreviation,
        archived: school.archived,
      }))
    );
  }

  for (const colorGroup of COLOR_GROUPS) {
    await seed.colorGroup((createMany) =>
      createMany(1, () => ({
        name: colorGroup.name,
        colorCodes: colorGroup.colorCodes,
      }))
    );
  }

  await seed.subject((createMany) =>
    createMany(numSubjects, (curSubject) => ({
      name: SUBJECTS[curSubject.index].name,
      abbreviation: SUBJECTS[curSubject.index].abbreviation,
      colorGroupId: SUBJECTS[curSubject.index].colorGroupId,
      archived: SUBJECTS[curSubject.index].archived,
    }))
  );

  await seed.lessonPlanFile((createMany) =>
    createMany(Math.floor(numAbsences / 2), () => {
      const baseFileName = faker.lorem
        .words({ min: 1, max: 3 })
        .replace(/\s+/g, '-');
      const fileName = `${baseFileName}.pdf`;
      const fileUrl = `https://drive.google.com/files/${baseFileName}.pdf`;
      return {
        name: fileName,
        url: fileUrl,
        size: faker.number.int({ min: 100, max: 100000000 }),
      };
    })
  );

  const isWeekday = (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const generateWeekdayFutureDate = (): Date => {
    let date: Date;
    do {
      date = faker.date.future({ years: 2 });
    } while (!isWeekday(date));
    return date;
  };

  const generateWeekdayPastDate = (): Date => {
    let date: Date;
    do {
      date = faker.date.past({ years: 2 });
    } while (!isWeekday(date));
    return date;
  };

  const halfAbsences = Math.floor(absenceIds.length / 2);

  for (let i = 0; i < absenceIds.length; i++) {
    const absenceId = absenceIds[i];
    const lessonPlanId = absenceId % 2 === 0 ? Math.floor(absenceId / 2) : null;

    const getLessonDate =
      i < halfAbsences ? generateWeekdayPastDate : generateWeekdayFutureDate;

    await seed.absence((createMany) =>
      createMany(1, () => {
        const maybeNotes = faker.helpers.maybe(() => faker.lorem.paragraph(), {
          probability: 0.5,
        });
        const absentTeacherId = faker.helpers.arrayElement(userIds);
        const possibleSubs = userIds.filter((id) => id !== absentTeacherId);
        const maybeSubstitute = faker.helpers.maybe(
          () => faker.helpers.arrayElement(possibleSubs),
          {
            probability: 0.5,
          }
        );
        return {
          lessonDate: getLessonDate(),
          lessonPlanId,
          reasonOfAbsence: faker.lorem.sentence(),
          notes: maybeNotes ?? null,
          roomNumber: faker.helpers.arrayElement(ROOM_NUMBERS),
          absentTeacherId,
          substituteTeacherId: maybeSubstitute ?? null,
        };
      })
    );
  }

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
