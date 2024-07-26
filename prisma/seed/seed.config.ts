import { SeedPrisma } from '@snaplet/seed/adapter-prisma';
import { defineConfig } from '@snaplet/seed/config';
import { PrismaClient } from '@prisma/client';
import { db } from '@vercel/postgres';

// export default defineConfig({
//   adapter: () => {
//     const client = new PrismaClient({
//       datasources: {
//         db: {
//           // url: process.env.POSTGRES_DATABASE,
//         },@vercel/postgres
//       },
//     });
//     return new SeedPrisma(client);
//   },
//   select: ['!*_prisma_migrations'],
// });

export default defineConfig({
  adapter: () => {
    const client = new PrismaClient();
    return new SeedPrisma(client);
  },
  select: ['!*_prisma_migrations'],
});
