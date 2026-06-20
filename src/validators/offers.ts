import { z } from "zod";

export const offerListSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  recruiter: z.string().optional(),
  page: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  limit: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  sortBy: z.enum(["offerDate", "validUntil", "totalCtc", "status", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const offerCreateSchema = z.object({
  candidateId: z.string().min(1),
  createdById: z.string().optional(),
  templateId: z.string().optional().nullable(),
  title: z.string().min(3),
  department: z.string().min(1),
  designation: z.string().min(2),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "RELEASED", "ACCEPTED", "DECLINED"]),
  baseSalary: z.preprocess((value) => Number(value), z.number().nonnegative()),
  variablePay: z.preprocess((value) => Number(value), z.number().nonnegative()),
  joiningBonus: z.preprocess((value) => Number(value), z.number().nonnegative()),
  retentionBonus: z.preprocess((value) => Number(value), z.number().nonnegative()),
  probationPeriodMonths: z.preprocess((value) => Number(value), z.number().int().nonnegative()),
  offerDate: z.string().min(10),
  validUntil: z.string().min(10),
  approvalComments: z.string().optional().nullable(),
  companyLogo: z.any().optional(),
  hrSignature: z.any().optional(),
  signatoryName: z.string().min(2, "Signatory name must be at least 2 characters").optional().nullable(),
  signatoryDesignation: z.string().min(2, "Signatory designation must be at least 2 characters").optional().nullable(),
  signatureDate: z.string().min(10, "Signature date is required").optional().nullable(),
});
