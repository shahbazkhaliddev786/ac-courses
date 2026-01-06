import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

import {
  successResponse,
  badRequest,
  notFound,
  serverError,
} from '@/lib/response';
import { isUUID } from 'validator';


export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    return serverError('Failed to fetch courses');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, categoryId } = body;

    if (!title || typeof title !== 'string') {
      return badRequest('Course title is required');
    }

    if (!categoryId || !isUUID(categoryId)) {
      return badRequest('Valid categoryId is required');
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return notFound();
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        categoryId,
      },
    });

    return successResponse(course, 'Course created successfully');
  } catch (error) {
    console.error('Create course error:', error);
    return serverError('Failed to create course');
  }
}
