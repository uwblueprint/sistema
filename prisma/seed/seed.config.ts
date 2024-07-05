import { SeedPrisma } from '@snaplet/seed/adapter-prisma';
import { defineConfig } from '@snaplet/seed/config';
import { PrismaClient } from '@prisma/client';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

export default defineConfig({
  adapter: () => {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    return new SeedPrisma(client);
  },
  select: ['!*_prisma_migrations'],
});
