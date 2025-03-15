import { SeedPrisma } from '@snaplet/seed/adapter-prisma';
import { defineConfig } from '@snaplet/seed/config';
import { prisma } from '@utils/prisma';

export default defineConfig({
  adapter: () => new SeedPrisma(prisma),
  select: ['!*_prisma_migrations'],
});
