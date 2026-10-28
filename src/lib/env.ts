/**
 * Server-side environment access.
 *
 * Only values read here may hold secrets: Next.js inlines any `NEXT_PUBLIC_*`
 * variable that client code references into the public browser bundle, so
 * secrets must stay unprefixed and be read from server modules only.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export function requireEnv(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isDevelopmentRuntime(): boolean {
  return process.env.NODE_ENV === "development";
}

export function getDatabaseUrl(): string {
  return requireEnv("DATABASE_URL");
}

export function getJwtAccessTokenSecret(): string {
  return requireEnv("JWT_ACCESS_TOKEN_SECRET");
}

export function getJwtRefreshTokenSecret(): string {
  return requireEnv("JWT_REFRESH_TOKEN_SECRET");
}

export function getHashSaltRounds(): number {
  const rounds = Number(read("HASH_SALT_ROUNDS"));
  return Number.isInteger(rounds) && rounds > 0 ? rounds : 10;
}

export function getAdminRegisterKey(): string | undefined {
  return read("ADMIN_REGISTER_KEY");
}
