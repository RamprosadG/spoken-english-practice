import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const userResponseSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isComplete: true,
  createdAt: true,
  updatedAt: true,
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
  password?: string;
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
