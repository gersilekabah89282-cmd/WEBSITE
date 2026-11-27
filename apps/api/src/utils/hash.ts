import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNUNDS);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const bytes = crypto.randomBytes(32);
  const key = `ssk_${bytes.toString('hex')}`;
  const hash = hashApiKey(key);
  const prefix = key.substring(0, 12);
  return { key, hash, prefix };
}

export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
