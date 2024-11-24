import { SeedPrisma } from '@snaplet/seed/adapter-prisma';
import { defineConfig } from '@snaplet/seed/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectPrisma() {
  await prisma.$connect();
}

connectPrisma().catch((e) => {
  console.error('Failed to connect to the database:', e);
  process.exit(1);
});

export default defineConfig({
  adapter: () => {
    return new SeedPrisma(prisma);
  },
  select: ['!*_prisma_migrations'],
});
