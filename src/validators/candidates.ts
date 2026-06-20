import { z } from "zod";

export const candidateListSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  recruiter: z.string().optional(),
  page: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  limit: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  sortBy: z.enum(["createdAt", "fullName", "expectedCtc", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const candidateCreateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  role: z.string().min(2),
  department: z.string().min(1),
  location: z.string().min(2),
  status: z.enum(["NEW", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"]),
  experienceYears: z.preprocess((value) => Number(value), z.number().int().nonnegative()),
  expectedCtc: z.preprocess((value) => Number(value), z.number().nonnegative()),
  currentCtc: z.preprocess((value) => Number(value), z.number().nonnegative()),
  noticePeriodDays: z.preprocess((value) => Number(value), z.number().int().nonnegative()),
  skills: z.string().optional(),
  resumeUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  recruiterId: z.string().optional().nullable(),
});

export const candidateBulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).nonempty(),
});

export const candidateNoteSchema = z.object({
  content: z.string().min(2),
});
