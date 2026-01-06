import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import {
  successResponse,
  badRequest,
  serverError,
} from '@/lib/response';

const ADMIN_SESSION_KEY = process.env.ADMIN_SESSION_KEY;

if (!ADMIN_SESSION_KEY) {
  throw new Error('ADMIN_SESSION_KEY is not defined in environment variables');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return badRequest('Email and password are required');
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return badRequest('Invalid input format');
    }

    // Find admin user (case-insensitive email)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!user) {
      // Don't reveal if email exists
      return badRequest('Invalid email or password');
    }

    // Check role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return badRequest('Invalid email or password');
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return badRequest('Invalid email or password');
    }

    // Set secure httpOnly cookie
    const cookieStore = await cookies();

    if (!ADMIN_SESSION_KEY) {
        throw new Error('ADMIN_SESSION_KEY is not defined');
    }

    cookieStore.set(ADMIN_SESSION_KEY, user.id, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', // Prevents CSRF
      path: '/',        
      maxAge: 60 * 60 * 24 * 7, 
    });

    return successResponse(
      { email: user.email, role: user.role },
      'Login successful'
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return serverError('Login failed. Please try again later.');
  }
}