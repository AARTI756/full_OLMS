import { describe, expect, it } from 'vitest';
import { settingsUpdateSchema } from '@/validators/settings';

describe('settings validation', () => {
  it('accepts an empty password field and partial payload', () => {
    const result = settingsUpdateSchema.safeParse({
      companyName: 'Test Co',
      smtpHost: 'smtp.example.com',
      smtpPassword: '',
      smtpSecure: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email values', () => {
    const result = settingsUpdateSchema.safeParse({
      companyName: 'Test Co',
      companyEmail: 'not-an-email',
    });

    expect(result.success).toBe(false);
    expect(result.error?.format().companyEmail?._errors[0]).toContain('Must be a valid email');
  });
});
