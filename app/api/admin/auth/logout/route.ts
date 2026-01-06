import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { successResponse } from '@/lib/response';

const ADMIN_SESSION_KEY = process.env.ADMIN_SESSION_KEY!;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_KEY);

  return successResponse(null, 'Logged out successfully');
}