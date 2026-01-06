import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export const successResponse = <T>(data: T, message = 'Success') =>
  NextResponse.json({ success: true, data, message }, { status: 200 });

export const createdResponse = <T>(data: T, message = 'Created') =>
  NextResponse.json({ success: true, data, message }, { status: 201 });


type ValidationError = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

export const badRequest = (
  error: string | ValidationError
) => {
  const payload = {
    success: false as const,
    error: typeof error === 'string' ? error : error,
  };

  return NextResponse.json(payload, { status: 400 });
};

export const unauthorized = () =>
  NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

export const notFound = () =>
  NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });

export const serverError = (error: string) =>
  NextResponse.json({ success: false, error: `Internal server error: ${error}`, }, { status: 500 });