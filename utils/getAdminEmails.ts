import { prisma } from '@utils/prisma';

export async function getAdminEmails(): Promise<string[]> {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });

    return adminUsers.map((u) => u.email);
  } catch (err) {
    console.error('Error fetching admin emails:', err);
    return [];
  }
}
