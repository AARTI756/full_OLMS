import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const algorithm = 'aes-256-gcm';
const ivLength = 12;
const tagLength = 16;

function getEncryptionKey() {
  const key = process.env.SETTINGS_ENCRYPTION_KEY ?? process.env.JWT_SECRET;
  if (!key || key.length < 32) {
    throw new Error('A 32-character SETTINGS_ENCRYPTION_KEY or JWT_SECRET is required to encrypt secrets.');
  }
  return Buffer.from(key.slice(0, 32), 'utf8');
}

export function encryptValue(value: string) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, getEncryptionKey(), iv, { authTagLength: tagLength });
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptValue(payload: string) {
  const data = Buffer.from(payload, 'base64');
  const iv = data.slice(0, ivLength);
  const authTag = data.slice(ivLength, ivLength + tagLength);
  const text = data.slice(ivLength + tagLength);
  const decipher = createDecipheriv(algorithm, getEncryptionKey(), iv, { authTagLength: tagLength });
  decipher.setAuthTag(authTag);
  return decipher.update(text, undefined, 'utf8') + decipher.final('utf8');
}
