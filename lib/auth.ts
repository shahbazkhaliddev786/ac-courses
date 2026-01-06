import { cookies } from 'next/headers';
import { prisma } from './prisma';

const ADMIN_SESSION_KEY = process.env.ADMIN_SESSION_KEY; 

export async function requireAdmin() {
  const cookieStore = await cookies();

  if (!ADMIN_SESSION_KEY) {
    console.error('ADMIN_SESSION_KEY is not defined in .env');
    return null;
  }

  const sessionId = cookieStore.get(ADMIN_SESSION_KEY)?.value;

  if (!sessionId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, email: true, role: true },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return null;
  }
}