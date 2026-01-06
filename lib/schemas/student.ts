import { z } from 'zod';

export const createStudentSchema = z.object({
  fullName: z.string().min(3),
  fatherName: z.string().min(3),
  dateOfBirth: z.string().date(),
  cnic: z.string().length(13, "CNIC must be 13 digits"),
  photoUrl: z.string().url().optional(),
  email: z.string().email(),
  contactNo: z.string().min(10),
  city: z.string().min(2),
  address: z.string().min(5),

  academicQualification: z.string().optional(),
  professionalQualification: z.string().optional(),
  experience: z.string().optional(),

  courseTitle: z.string().min(3),
  session: z.string().min(4),
  modeOfStudy: z.enum(['REGULAR', 'RPL', 'DISTANCE']),
  duration: z.enum(['SIX_MONTHS', 'ONE_YEAR', 'TWO_YEARS']),

  depositAmount: z.number().positive().optional(),
  bankNameAndBranchCode: z.string().optional(),
  depositDetails: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  registrationNo: z.string().optional(),
  rollNo: z.string().optional(),
  totalMarks: z.number().int().min(0).optional(),
  obtainedMarks: z.number().int().min(0).optional(),
  grade: z.string().optional(),
});