import { SeedPrisma } from '@snaplet/seed/adapter-prisma';
import { defineConfig } from '@snaplet/seed/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectPrisma() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'production') {
  connectPrisma();
}

export default defineConfig({
  adapter: () => {
    return new SeedPrisma(prisma);
  },
  select: ['!*_prisma_migrations'],
});
