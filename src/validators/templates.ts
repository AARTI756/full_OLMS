import { z } from "zod";

export const templateListSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["active", "archived", "draft", "all"]).optional(),
  page: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  limit: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  sortBy: z.enum(["updatedAt", "createdAt", "title", "category"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const templateCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(1),
  content: z.string().min(1),
  isActive: z.boolean().optional(),
  isDraft: z.boolean().optional(),
});

export const templateUpdateSchema = z.object({
  title: z.string().min(3),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(1),
  content: z.string().min(1),
  isActive: z.boolean().optional(),
  isDraft: z.boolean().optional(),
});

export const templatePatchSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  isDraft: z.boolean().optional(),
});

export const templateActionSchema = z.object({
  action: z.enum(["duplicate", "restore", "archive"]),
});
