import { prisma } from '@utils/prisma';

const getExcludedEmails = () => {
  const raw = process.env.ADMIN_EMAIL_EXCLUSIONS;
  if (!raw) return new Set<string>();

  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
};

export async function getAdminEmails(): Promise<string[]> {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });

    const excluded = getExcludedEmails();

    return adminUsers
      .map((u) => u.email)
      .filter((email) => !excluded.has(email.toLowerCase()));
  } catch (err) {
    console.error('Error fetching admin emails:', err);
    return [];
  }
}
