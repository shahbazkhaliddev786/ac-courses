import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  badRequest,
  serverError,
} from '@/lib/response';
import { Prisma } from '@/src/generated/client'; 

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return serverError('Failed to fetch categories');
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return badRequest('Category name is required');
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return badRequest('Category name cannot be empty');
    }

    const category = await prisma.category.create({
      data: { name: trimmedName },
    });

    return successResponse(category, 'Category created successfully');
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return badRequest('Category name already exists');
    }

    console.error('Create category error:', error);
    return serverError('Failed to create category');
  }
}
