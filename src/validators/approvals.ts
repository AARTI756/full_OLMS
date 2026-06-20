import { z } from "zod";

export const approvalListSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  limit: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
});

export const approvalActionSchema = z.object({
  decision: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  comments: z.string().optional().nullable(),
});
