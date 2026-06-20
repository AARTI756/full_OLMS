import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env", override: true });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  REFRESH_TOKEN_SECRET: z.string().min(16),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_SUPPORT_EMAIL: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.coerce.number().optional(),
  EMAIL_FROM: z.string().optional(),
  SETTINGS_ENCRYPTION_KEY: z.string().min(32).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = Object.entries(parsed.error.format())
    .filter(([key]) => key !== "_errors")
    .map(([key, value]) => {
      const errors = (value as { _errors?: string[] })._errors ?? [];
      return errors.length ? `${key}: ${errors.join(", ")}` : null;
    })
    .filter(Boolean);

  throw new Error(
    `Environment validation failed: ${messages.length ? messages.join("; ") : "invalid environment variables"}`
  );
}

export const env = parsed.data;
