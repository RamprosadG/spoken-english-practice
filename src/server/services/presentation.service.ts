import { cache } from "react";
import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { PresentationInput } from "@/lib/validations/presentation";
import {
  createPresentation as createPresentationRecord,
  deletePresentation as deletePresentationRecord,
  findNextPresentationSequence,
  findPresentationById,
  findPresentationBySlugOrId,
  findPresentationNeighbors,
  findPresentationPage,
  updatePresentation as updatePresentationRecord,
  type PresentationSelected,
} from "@/server/repositories/presentation.repository";
import { requireAdminUser, canViewUnpublishedContent } from "@/server/services/auth.service";
import {
  getCategoryOptions,
  getManagedCategories,
  requireCategory,
} from "@/server/services/category.service";
import type {
  PresentationFilterParams,
  PresentationPageResult,
} from "@/server/types/presentation";
import type {
  PresentationItem,
  PresentationNavigation,
} from "@/types/presentation";

export const PRESENTATION_PAGE_SIZE = 20;

function toPresentationItem(
  presentation: PresentationSelected,
): PresentationItem {
  return {
    id: presentation.id,
    title: presentation.title,
    slug: presentation.slug,
    text: presentation.text,
    sequence: presentation.sequence,
    isPublished: presentation.isPublished,
    categoryId: presentation.categoryId,
    categoryName: presentation.category.name,
    createdAt: presentation.createdAt.toISOString(),
    updatedAt: presentation.updatedAt.toISOString(),
  };
}

export async function listPresentations(
  query: PresentationFilterParams,
): Promise<PresentationPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  // Drafts are an admin-only view, and the gate runs inside the SQL query.
  const canViewUnpublished = await canViewUnpublishedContent();

  const [list, nextSequence, categories, categoryRows] = await Promise.all([
    findPresentationPage({
      ...query,
      canViewUnpublished,
      search: query.search?.trim() || undefined,
      categoryId: query.categoryId?.trim() || undefined,
    }),
    findNextPresentationSequence(),
    getCategoryOptions("presentation"),
    // Usage counts cover drafts, so only an admin is given the management rows.
    canViewUnpublished
      ? getManagedCategories("presentation")
      : Promise.resolve([]),
  ]);

  return { ...list, nextSequence, categories, categoryRows };
}

// generateMetadata and the page read the same row, so one request shares one read.
export const getPresentationWithNavigation = cache(
  async (slugOrId: string): Promise<PresentationNavigation | null> => {
    // Neighbours move with every saved row, so never prerender this.
    await connection();

    const canViewUnpublished = await canViewUnpublishedContent();

    const presentation = await findPresentationBySlugOrId(slugOrId);
    if (!presentation) {
      return null;
    }

    if (!canViewUnpublished && !presentation.isPublished) {
      return null;
    }

    const neighbors = await findPresentationNeighbors(
      {
        sequence: presentation.sequence,
        createdAt: presentation.createdAt,
      },
      { canViewUnpublished },
    );

    return {
      presentation: toPresentationItem(presentation),
      previousSlug: neighbors.previousSlug,
      nextSlug: neighbors.nextSlug,
    };
  },
);

export async function createPresentation(
  input: PresentationInput,
): Promise<PresentationItem> {
  await requireAdminUser();
  await requireCategory("presentation", input.categoryId);

  try {
    const presentation = await createPresentationRecord(input);
    return toPresentationItem(presentation);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A presentation with this title already exists.",
    );
  }
}

export async function updatePresentation(
  id: string,
  input: PresentationInput,
): Promise<PresentationItem> {
  await requireAdminUser();
  await requireCategory("presentation", input.categoryId);

  const existing = await findPresentationById(id);
  if (!existing) {
    throw new ApiError(404, "Presentation is not found.");
  }

  try {
    const presentation = await updatePresentationRecord(id, input);
    return toPresentationItem(presentation);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A presentation with this title already exists.",
    );
  }
}

export async function deletePresentation(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findPresentationById(id);
  if (!existing) {
    throw new ApiError(404, "Presentation is not found.");
  }

  await deletePresentationRecord(id);
}
