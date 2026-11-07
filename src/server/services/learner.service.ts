import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import { hashPassword } from "@/lib/auth/password";
import type {
  LearnerCreateInput,
  LearnerUpdateInput,
} from "@/lib/validations/learner";
import {
  createUser,
  deleteUserById,
  findLearnerPage,
  findUserByEmail,
  findUserRecordById,
  updateUser,
} from "@/server/repositories/user.repository";
import {
  canViewUnpublishedContent,
  requireAdminUser,
} from "@/server/services/auth.service";
import type {
  LearnerFilterParams,
  LearnerListResult,
  LearnerRow,
} from "@/server/types/learner";

export const LEARNER_PAGE_SIZE = 20;

const DUPLICATE_EMAIL_MESSAGE = "This email is already registered.";

interface WritableUser {
  id: string;
  name: string;
  email: string;
  role: LearnerRow["role"];
}

function toLearnerRow(user: WritableUser): LearnerRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Only an admin reaches this page, so the page guard and the route handlers
 * share one gate. The role check never writes a cookie, so a Server Component
 * may call it.
 */
export async function canManageLearners(): Promise<boolean> {
  return canViewUnpublishedContent();
}

export async function listLearners(
  query: LearnerFilterParams,
): Promise<LearnerListResult> {
  // The account list changes with every registration, so never prerender this.
  await connection();

  if (!(await canManageLearners())) {
    throw new ApiError(
      403,
      "You do not have permission to perform this action.",
    );
  }

  return findLearnerPage({
    ...query,
    search: query.search?.trim() || undefined,
  });
}

export async function createLearner(
  input: LearnerCreateInput,
): Promise<LearnerRow> {
  await requireAdminUser();

  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ApiError(409, DUPLICATE_EMAIL_MESSAGE);
  }

  try {
    const user = await createUser({
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password),
      role: input.role,
      // An account made here already has a name and a password, so it signs in
      // straight away instead of opening the complete-profile flow.
      isComplete: true,
    });

    return toLearnerRow(user);
  } catch (error) {
    throw uniqueViolationError(error, DUPLICATE_EMAIL_MESSAGE);
  }
}

export async function updateLearner(
  id: string,
  input: LearnerUpdateInput,
): Promise<LearnerRow> {
  await requireAdminUser();

  const existing = await findUserRecordById(id);
  if (!existing) {
    throw new ApiError(404, "Learner is not found.");
  }

  const owner = await findUserByEmail(input.email);
  if (owner && owner.id !== id) {
    throw new ApiError(409, DUPLICATE_EMAIL_MESSAGE);
  }

  // Both password fields stay empty unless the admin means to replace the
  // hash, so a Google account keeps signing in through Google.
  const data = {
    name: input.name,
    email: input.email,
    role: input.role,
    ...(input.password ? { password: await hashPassword(input.password) } : {}),
  };

  try {
    const user = await updateUser(id, data);
    return toLearnerRow(user);
  } catch (error) {
    throw uniqueViolationError(error, DUPLICATE_EMAIL_MESSAGE);
  }
}

export async function deleteLearner(id: string): Promise<void> {
  const admin = await requireAdminUser();

  // Deleting your own account is the one write that locks every admin out of
  // this page, so it is refused rather than confirmed.
  if (admin.id === id) {
    throw new ApiError(400, "You cannot delete your own account.");
  }

  const existing = await findUserRecordById(id);
  if (!existing) {
    throw new ApiError(404, "Learner is not found.");
  }

  await deleteUserById(id);
}
