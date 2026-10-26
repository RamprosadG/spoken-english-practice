import { prisma } from "@/lib/prisma";

interface CreateRefreshTokenData {
  hashedToken: string;
  userId: string;
  expiresAt: Date;
}

export function createRefreshToken(data: CreateRefreshTokenData) {
  return prisma.refreshToken.create({ data });
}

export function findRefreshTokenByHash(hashedToken: string) {
  return prisma.refreshToken.findUnique({ where: { hashedToken } });
}

export function deleteRefreshTokenById(id: string) {
  return prisma.refreshToken.delete({ where: { id } });
}

export function deleteRefreshTokensForUser(userId: string) {
  return prisma.refreshToken.deleteMany({ where: { userId } });
}

export function deleteExpiredRefreshTokens(userId: string) {
  return prisma.refreshToken.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });
}

export function rotateRefreshToken(
  oldTokenId: string,
  newToken: CreateRefreshTokenData,
) {
  return prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: oldTokenId },
      data: { used: true, usedAt: new Date() },
    });

    return tx.refreshToken.create({ data: newToken });
  });
}
