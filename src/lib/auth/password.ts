import bcrypt from "bcryptjs";

const configuredRounds = Number(process.env.HASH_SALT_ROUNDS);
const saltRounds =
  Number.isInteger(configuredRounds) && configuredRounds > 0
    ? configuredRounds
    : 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
