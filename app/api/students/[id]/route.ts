import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { updateStudentSchema } from '@/lib/schemas/student';
import {
  successResponse,
  badRequest,
  unauthorized,
  notFound,
  serverError,
} from '@/lib/response';
import { Prisma } from '@/src/generated/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!student) return notFound();

    return successResponse(student);
  } catch (error) {
    console.error('Fetch student error:', error);
    return serverError('Failed to fetch student');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const parsed = updateStudentSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.flatten()); 
    }

    const existing = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existing) return notFound();

    if (parsed.data.registrationNo || parsed.data.rollNo) {
      const duplicate = await prisma.student.findFirst({
        where: {
          OR: [
            parsed.data.registrationNo
              ? { registrationNo: parsed.data.registrationNo }
              : {},
            parsed.data.rollNo
              ? { rollNo: parsed.data.rollNo }
              : {},
          ],
          NOT: { id: params.id },
        },
      });

      if (duplicate) {
        return badRequest('Registration No or Roll No already assigned to another student');
      }
    }

    const updated = await prisma.student.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return successResponse(updated, 'Student updated successfully');
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return notFound();
    }

    console.error('Update student error:', error);
    return serverError('Update failed');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const existing = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existing) return notFound();

    await prisma.student.delete({ where: { id: params.id } });

    return successResponse(null, 'Student deleted successfully');
  } catch (error) {
    console.error('Delete student error:', error);
    return serverError('Delete failed');
  }
}
