import type { Prisma, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  LearnerFilterParams,
  LearnerListResult,
} from "@/server/types/learner";

export const userResponseSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isComplete: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** The managed list reads only what its own table shows, never the hash. */
const learnerSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

interface CreateUserData {
  name: string;
  email: string;
  password: string | null;
  role?: UserRole;
  isComplete?: boolean;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isComplete?: boolean;
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserRecordById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: userResponseSelect,
  });
}

export function countUsers() {
  return prisma.user.count();
}

export function createUser(data: CreateUserData) {
  return prisma.user.create({
    data,
    select: userResponseSelect,
  });
}

export function updateUser(id: string, data: UpdateUserData) {
  return prisma.user.update({
    where: { id },
    data,
    select: userResponseSelect,
  });
}

/**
 * Search, the role filter and pagination all run in PostgreSQL, so only the
 * requested page of accounts is fetched and the password hash never leaves.
 */
export async function findLearnerPage(
  filters: LearnerFilterParams,
): Promise<LearnerListResult> {
  const where: Prisma.UserWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.role) {
    where.role = filters.role;
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.user.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const users = await prisma.user.findMany({
    where,
    // Newest first. `email` is the tiebreak because Postgres stamps now() once
    // per transaction, so accounts written together share a createdAt and an
    // unstable order would repeat or drop a row across pages.
    orderBy: [{ createdAt: "desc" }, { email: "asc" }],
    select: learnerSelect,
    skip,
    take: pageSize,
  });

  return {
    items: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })),
    pagination,
  };
}

/** The cascade on `refresh_token` removes the account's live sessions. */
export function deleteUserById(id: string) {
  return prisma.user.delete({ where: { id } });
}
