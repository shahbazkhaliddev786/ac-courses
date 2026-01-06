import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createStudentSchema } from '@/lib/schemas/student';
import {
  successResponse,
  createdResponse,
  badRequest,
  unauthorized,
  serverError,
} from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
import { Prisma } from '@/src/generated/client'; 

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  console.log(request)

  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(students, 'Students fetched successfully');
  } catch (error) {
    console.error('Fetch students error:', error);
    return serverError('Failed to fetch students');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createStudentSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.flatten());
    }

    const data = parsed.data;

    const student = await prisma.student.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        depositAmount: data.depositAmount ?? null,
      },
    });

    return createdResponse(student, 'Registration successful. Awaiting approval.');
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = (error.meta?.target as string[] | undefined);
      const field = target?.[0];

      let fieldName = 'Field';
      if (field === 'cnic') fieldName = 'CNIC';
      else if (field === 'email') fieldName = 'Email';

      return badRequest(`${fieldName} already registered`);
    }

    console.error('Student registration error:', error);
    return serverError('Registration failed');
  }
}