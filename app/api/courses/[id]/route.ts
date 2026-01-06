import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  badRequest,
  notFound,
  serverError,
} from '@/lib/response';
import { isUUID } from 'validator';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isUUID(id)) return badRequest('Invalid course ID');

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!course) return notFound();

    return successResponse(course);
  } catch (error) {
    console.error('Fetch course error:', error);
    return serverError('Failed to fetch course');
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isUUID(id)) return badRequest('Invalid course ID');

  try {
    const body = await request.json();
    const { title, categoryId } = body;

    const existing = await prisma.course.findUnique({
      where: { id },
    });

    if (!existing) return notFound();

    if (categoryId) {
      if (!isUUID(categoryId)) {
        return badRequest('Invalid categoryId');
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return notFound();
      }
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title: title?.trim(),
        categoryId,
      },
    });

    return successResponse(updated, 'Course updated successfully');
  } catch (error) {
    console.error('Update course error:', error);
    return serverError('Failed to update course');
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isUUID(id)) return badRequest('Invalid course ID');

  try {
    const existing = await prisma.course.findUnique({
      where: { id },
    });

    if (!existing) return notFound();

    await prisma.course.delete({ where: { id } });

    return successResponse(null, 'Course deleted successfully');
  } catch (error) {
    console.error('Delete course error:', error);
    return serverError('Failed to delete course');
  }
}
