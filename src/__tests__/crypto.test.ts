import { describe, expect, it, beforeAll, afterAll } from 'vitest';

let encryptValue: (value: string) => string;
let decryptValue: (payload: string) => string;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET?.padEnd(32, 'x') ?? 'x'.repeat(32);
  const cryptoModule = await import('@/lib/crypto');
  encryptValue = cryptoModule.encryptValue;
  decryptValue = cryptoModule.decryptValue;
});

afterAll(() => {
  delete process.env.JWT_SECRET;
});

describe('crypto utilities', () => {
  it('round-trips encrypted values', () => {
    const original = 'super-secret-password';
    const encrypted = encryptValue(original);
    const decrypted = decryptValue(encrypted);

    expect(decrypted).toBe(original);
  });
});
