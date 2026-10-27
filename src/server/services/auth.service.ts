import type { UserRole } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-error";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearAuthCookies,
  hashToken,
  isRefreshTokenReused,
  readAuthCookies,
  REFRESH_TOKEN_TTL_MS,
  setAuthTokenCookies,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/tokens";
import type {
  CompleteProfileInput,
  LoginInput,
  RegisterAdminInput,
  RegisterInput,
} from "@/lib/validations/auth";
import {
  createRefreshToken,
  deleteExpiredRefreshTokens,
  deleteRefreshTokenById,
  deleteRefreshTokensForUser,
  findRefreshTokenByHash,
  rotateRefreshToken,
} from "@/server/repositories/refresh-token.repository";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserRecordById,
  updateUser,
} from "@/server/repositories/user.repository";
import type { AuthUser } from "@/types/auth";

interface UserProfileRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toAuthUser(user: UserProfileRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isComplete: user.isComplete,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function startSession(userId: string): Promise<void> {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await deleteRefreshTokensForUser(userId);
  await createRefreshToken({
    hashedToken: hashToken(refreshToken),
    userId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });
  await setAuthTokenCookies(accessToken, refreshToken);
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ApiError(409, "Email already exists.");
  }

  const user = await createUser({
    name: input.name,
    email: input.email,
    password: await hashPassword(input.password),
    isComplete: true,
  });

  return toAuthUser(user);
}

export async function registerAdminUser(
  input: RegisterAdminInput,
): Promise<AuthUser> {
  const adminRegisterKey = process.env.ADMIN_REGISTER_KEY;
  if (!adminRegisterKey) {
    throw new ApiError(500, "Admin registration is not configured.");
  }

  if (input.adminSecretKey !== adminRegisterKey) {
    throw new ApiError(403, "Invalid admin secret key.");
  }

  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ApiError(409, "Email already exists.");
  }

  const user = await createUser({
    name: input.name,
    email: input.email,
    password: await hashPassword(input.password),
    role: "admin",
    isComplete: true,
  });

  return toAuthUser(user);
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new ApiError(401, "Your email is not registered.");
  }

  if (!user.password) {
    throw new ApiError(
      401,
      "This account uses Google sign-in. Please continue with Google.",
    );
  }

  const isPasswordValid = await verifyPassword(input.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Your password is incorrect.");
  }

  await startSession(user.id);
  return toAuthUser(user);
}

interface GoogleUserInfo {
  email?: string;
  name?: string;
}

export async function loginWithGoogle(
  googleAccessToken: string,
): Promise<AuthUser> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ApiError(401, "Google authentication failed. Please try again.");
  }

  const googleUser = (await response.json()) as GoogleUserInfo;
  if (!googleUser.email) {
    throw new ApiError(401, "Unable to read the email from your Google account.");
  }

  const email = googleUser.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    await startSession(existingUser.id);
    return toAuthUser(existingUser);
  }

  const user = await createUser({
    name: googleUser.name?.trim() || email.split("@")[0] || "Google user",
    email,
    password: null,
    isComplete: false,
  });

  await startSession(user.id);
  return toAuthUser(user);
}

export async function getProfile(userId: string): Promise<AuthUser> {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(404, "User is not found.");
  }
  return toAuthUser(user);
}

export async function completeProfile(
  userId: string,
  input: CompleteProfileInput,
): Promise<AuthUser> {
  const existing = await findUserRecordById(userId);
  if (!existing) {
    throw new ApiError(404, "User is not found.");
  }

  const user = await updateUser(userId, {
    name: input.name,
    password: await hashPassword(input.password),
    isComplete: true,
  });

  await startSession(userId);
  return toAuthUser(user);
}

export async function logoutUser(): Promise<void> {
  const { refreshToken } = await readAuthCookies();

  if (refreshToken) {
    const tokenRecord = await findRefreshTokenByHash(hashToken(refreshToken));
    if (tokenRecord) {
      await deleteRefreshTokensForUser(tokenRecord.userId);
    }
  }

  await clearAuthCookies();
}

export async function resolveSessionUser(): Promise<AuthUser | null> {
  const { accessToken, refreshToken } = await readAuthCookies();

  if (accessToken) {
    const userId = verifyAccessToken(accessToken);
    if (userId) {
      const user = await findUserById(userId);
      if (user) {
        return toAuthUser(user);
      }
      await clearAuthCookies();
      return null;
    }
  }

  if (!refreshToken) {
    if (accessToken) {
      await clearAuthCookies();
    }
    return null;
  }

  const userId = verifyRefreshToken(refreshToken);
  if (!userId) {
    await clearAuthCookies();
    return null;
  }

  const tokenRecord = await findRefreshTokenByHash(hashToken(refreshToken));
  if (!tokenRecord || tokenRecord.userId !== userId) {
    await clearAuthCookies();
    return null;
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    await deleteRefreshTokenById(tokenRecord.id);
    await clearAuthCookies();
    return null;
  }

  if (isRefreshTokenReused(tokenRecord.used, tokenRecord.usedAt)) {
    await deleteRefreshTokensForUser(userId);
    await clearAuthCookies();
    return null;
  }

  const user = await findUserById(userId);
  if (!user) {
    await clearAuthCookies();
    return null;
  }

  const nextAccessToken = signAccessToken(userId);
  const nextRefreshToken = signRefreshToken(userId);

  await rotateRefreshToken(tokenRecord.id, {
    hashedToken: hashToken(nextRefreshToken),
    userId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });
  await deleteExpiredRefreshTokens(userId);
  await setAuthTokenCookies(nextAccessToken, nextRefreshToken);

  return toAuthUser(user);
}

export async function requireSessionUser(): Promise<AuthUser> {
  const user = await resolveSessionUser();
  if (!user) {
    throw new ApiError(401, "You are not logged in.");
  }
  return user;
}

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await requireSessionUser();
  if (user.role !== "admin") {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }
  return user;
}
