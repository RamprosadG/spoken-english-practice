import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const ACCESS_TOKEN_TTL_SECONDS = 30 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
export const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_SECONDS * 1000;
export const REFRESH_TOKEN_GRACE_PERIOD_MS = 30 * 1000;

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/",
};

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_TOKEN_SECRET is not configured.");
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_TOKEN_SECRET is not configured.");
  }
  return secret;
}

function readTokenId(token: string, secret: string): string | null {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS512"] });
    if (typeof decoded === "string" || typeof decoded.id !== "string") {
      return null;
    }
    return decoded.id;
  } catch {
    return null;
  }
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ id: userId }, getAccessSecret(), {
    algorithm: "HS512",
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, getRefreshSecret(), {
    algorithm: "HS512",
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    jwtid: crypto.randomUUID(),
  });
}

export function verifyAccessToken(token: string): string | null {
  return readTokenId(token, getAccessSecret());
}

export function verifyRefreshToken(token: string): string | null {
  return readTokenId(token, getRefreshSecret());
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isRefreshTokenReused(
  used: boolean,
  usedAt: Date | null,
): boolean {
  if (!used) return false;
  if (!usedAt) return true;
  return Date.now() - usedAt.getTime() > REFRESH_TOKEN_GRACE_PERIOD_MS;
}

export async function readAuthCookies(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

export async function setAccessTokenCookie(accessToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...authCookieOptions,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export async function setRefreshTokenCookie(
  refreshToken: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...authCookieOptions,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export async function setAuthTokenCookies(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await setAccessTokenCookie(accessToken);
  await setRefreshTokenCookie(refreshToken);
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
}
