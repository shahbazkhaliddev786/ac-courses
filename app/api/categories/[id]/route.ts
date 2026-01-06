import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  badRequest,
  notFound,
  serverError,
} from '@/lib/response';
import { Prisma } from '@/src/generated/client';
import { isUUID } from 'validator';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isUUID(id)) {
    return badRequest('Invalid category ID');
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) return notFound();

    return successResponse(category);
  } catch (error) {
    console.error('Fetch category error:', error);
    return serverError('Failed to fetch category');
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isUUID(id)) {
    return badRequest('Invalid category ID');
  }

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

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) return notFound();

    const updated = await prisma.category.update({
      where: { id },
      data: { name: trimmedName },
    });

    return successResponse(updated, 'Category updated successfully');
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return badRequest('Category name already exists');
    }

    console.error('Update category error:', error);
    return serverError('Failed to update category');
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isUUID(id)) {
    return badRequest('Invalid category ID');
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) return notFound();

    await prisma.category.delete({
      where: { id },
    });

    return successResponse(null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return serverError('Failed to delete category');
  }
}
