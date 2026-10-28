import bcrypt from "bcryptjs";
import { getHashSaltRounds } from "@/lib/env";

const saltRounds = getHashSaltRounds();

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
