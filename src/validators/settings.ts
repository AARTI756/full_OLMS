import { z } from "zod";

const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid HEX color")
  .optional()
  .nullable();

const optionalString = z.string().trim().max(255).optional().nullable();

export const settingsUpdateSchema = z
  .object({
    companyName: z.string().trim().min(1, "Company name is required"),
    companyWebsite: optionalString,
    companyEmail: z.string().trim().email("Must be a valid email").optional().nullable(),
    companyPhone: optionalString,
    companyAddress: z.string().trim().max(1000).optional().nullable(),
    brandingLogoUrl: z.string().trim().url("Must be a valid URL").optional().nullable(),
    brandingPrimaryColor: colorSchema,
    brandingSecondaryColor: colorSchema,
    smtpHost: z.string().trim().max(255).optional().nullable(),
    smtpPort: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      return Number(value);
    }, z.number().int().positive().max(65535)).optional().nullable(),
    smtpUser: optionalString,
    smtpFromName: z.string().trim().max(100).optional().nullable(),
    smtpFromEmail: z.string().trim().email("Must be a valid email").optional().nullable(),
    smtpSecure: z.boolean().optional(),
    smtpPassword: z.preprocess((value) => {
      if (value === "") {
        return undefined;
      }
      return value;
    }, z.string().trim().min(1).optional().nullable()),
    notificationOfferEmail: z.boolean().optional(),
    notificationCandidateEmail: z.boolean().optional(),
    notificationSystemAlerts: z.boolean().optional(),
    notificationDigestFrequency: z.enum(["instant", "daily", "weekly"]).optional(),
    offerApprovalRequired: z.boolean().optional(),
    offerAutoRelease: z.boolean().optional(),
    automationEmailReminders: z.boolean().optional(),
    automationExpiryThresholdDays: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      return Number(value);
    }, z.number().int().positive().max(30)).optional(),
    automationApprovalReminderHours: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      return Number(value);
    }, z.number().int().positive().max(168)).optional(),
    automationStaleCandidateDays: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      return Number(value);
    }, z.number().int().positive().max(60)).optional(),
    automationCleanupDays: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      return Number(value);
    }, z.number().int().positive().max(365)).optional(),
    securityRequireStrongPassword: z.boolean().optional(),
    securityEnableTwoFactor: z.boolean().optional(),
    securitySessionTimeoutMinutes: z.preprocess((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      return Number(value);
    }, z.number().int().positive().min(5).max(1440)).optional().nullable(),
  })
  .partial();
