import { Prisma } from "@/generated/prisma/client";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import { CATEGORY_ENTITY_LABELS, categoryUsageLabel, type CategoryKind } from "@/lib/categories";
import type { CategoryInput } from "@/lib/validations/category";
import {
  countCategoryUsage,
  createCategory as createCategoryRecord,
  deleteCategory as deleteCategoryRecord,
  findCategoryById,
  findCategoryOptions,
  findCategoryRows,
  findNextCategorySequence,
  updateCategory as updateCategoryRecord,
} from "@/server/repositories/category.repository";
import { requireAdminUser } from "@/server/services/auth.service";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

export function getCategoryOptions(kind: CategoryKind): Promise<CategoryOption[]> {
  return findCategoryOptions(kind);
}

/**
 * Usage counts are read over the whole table, so this is the management view and
 * only ever runs behind an admin check.
 */
export function getManagedCategories(kind: CategoryKind): Promise<CategoryRow[]> {
  return findCategoryRows(kind);
}

/**
 * The foreign key is required, so an unknown id must fail as a 400 instead of
 * reaching PostgreSQL as a constraint violation.
 */
export async function requireCategory(
  kind: CategoryKind,
  id: string,
): Promise<{ id: string; name: string; sequence: number }> {
  const category = await findCategoryById(kind, id);
  if (!category) {
    throw new ApiError(400, "Selected category does not exist.");
  }

  return category;
}

export async function createCategory(
  kind: CategoryKind,
  input: CategoryInput,
): Promise<CategoryRow> {
  await requireAdminUser();

  const sequence = input.sequence ?? (await findNextCategorySequence(kind));

  try {
    return await createCategoryRecord(kind, { name: input.name, sequence });
  } catch (error) {
    throw uniqueViolationError(
      error,
      `A ${CATEGORY_ENTITY_LABELS[kind]} category with this name already exists.`,
    );
  }
}

export async function updateCategory(
  kind: CategoryKind,
  id: string,
  input: CategoryInput,
): Promise<CategoryRow> {
  await requireAdminUser();

  const existing = await findCategoryById(kind, id);
  if (!existing) {
    throw new ApiError(404, "Category is not found.");
  }

  try {
    return await updateCategoryRecord(kind, id, {
      name: input.name,
      sequence: input.sequence ?? existing.sequence,
    });
  } catch (error) {
    throw uniqueViolationError(
      error,
      `A ${CATEGORY_ENTITY_LABELS[kind]} category with this name already exists.`,
    );
  }
}

export async function deleteCategory(
  kind: CategoryKind,
  id: string,
): Promise<void> {
  await requireAdminUser();

  const existing = await findCategoryById(kind, id);
  if (!existing) {
    throw new ApiError(404, "Category is not found.");
  }

  const usage = await countCategoryUsage(kind, id);
  if (usage > 0) {
    throw new ApiError(
      409,
      `"${existing.name}" still has ${categoryUsageLabel(kind, usage)} assigned to it. Move them to another category first.`,
    );
  }

  try {
    await deleteCategoryRecord(kind, id);
  } catch (error) {
    // A row created between the count and the delete still hits the RESTRICT key.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new ApiError(
        409,
        `"${existing.name}" still has ${CATEGORY_ENTITY_LABELS[kind]}s assigned to it. Move them to another category first.`,
      );
    }

    throw error;
  }
}
