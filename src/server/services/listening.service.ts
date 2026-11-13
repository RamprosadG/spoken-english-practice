import { cache } from "react";
import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { ListeningInput } from "@/lib/validations/listening";
import {
  createListening as createListeningRecord,
  deleteListening as deleteListeningRecord,
  findListeningById,
  findListeningNeighbors,
  findListeningPage,
  findNextListeningSequence,
  updateListening as updateListeningRecord,
  type ListeningWithItems,
} from "@/server/repositories/listening.repository";
import { canViewUnpublishedContent, requireAdminUser } from "@/server/services/auth.service";
import {
  getCategoryOptions,
  getManagedCategories,
  requireCategory,
} from "@/server/services/category.service";
import type {
  ListeningFilterParams,
  ListeningPageResult,
} from "@/server/types/listening";
import type {
  Listening,
  ListeningDetail,
  ListeningItem,
  ListeningNavigation,
} from "@/types/listening";

export const LISTENING_PAGE_SIZE = 20;

function toListeningItem(item: ListeningWithItems["items"][number]): ListeningItem {
  return {
    id: item.id,
    text: item.text,
    sequence: item.sequence,
  };
}

function toListening(listening: ListeningWithItems): Listening {
  return {
    id: listening.id,
    title: listening.title,
    sequence: listening.sequence,
    isPublished: listening.isPublished,
    categoryId: listening.categoryId,
    categoryName: listening.category.name,
    itemCount: listening.items.length,
    createdAt: listening.createdAt.toISOString(),
    updatedAt: listening.updatedAt.toISOString(),
  };
}

function toListeningDetail(listening: ListeningWithItems): ListeningDetail {
  return {
    ...toListening(listening),
    items: listening.items.map(toListeningItem),
  };
}

export async function listListenings(
  query: ListeningFilterParams,
): Promise<ListeningPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  // Drafts are an admin-only view, and the gate runs inside the SQL query.
  const canViewUnpublished = await canViewUnpublishedContent();

  const [list, nextSequence, categories, categoryRows] = await Promise.all([
    findListeningPage({
      ...query,
      canViewUnpublished,
      search: query.search?.trim() || undefined,
      categoryId: query.categoryId?.trim() || undefined,
    }),
    findNextListeningSequence(),
    getCategoryOptions("listening"),
    // Usage counts cover drafts, so only an admin is given the management rows.
    canViewUnpublished ? getManagedCategories("listening") : Promise.resolve([]),
  ]);

  return { ...list, nextSequence, categories, categoryRows };
}

export async function getListeningDetail(id: string): Promise<ListeningDetail> {
  await connection();

  const listening = await findListeningById(id);
  if (!listening) {
    throw new ApiError(404, "Listening is not found.");
  }

  if (!(await canViewUnpublishedContent()) && !listening.isPublished) {
    throw new ApiError(404, "Listening is not found.");
  }

  return toListeningDetail(listening);
}

/**
 * The practice route needs a missing or unpublished row to render `notFound()`
 * rather than an API error, so this read answers with null. It also walks to the
 * neighbouring listenings, because the page's Previous and Next move through the
 * library rather than through one listening's sentences.
 */
// generateMetadata and the page read the same row, so one request shares one read.
export const getListeningWithNavigation = cache(
  async (id: string): Promise<ListeningNavigation | null> => {
    // Which rows a reader may open, and which sit next to them, both change per
    // request, so never prerender this.
    await connection();

    const canViewUnpublished = await canViewUnpublishedContent();

    const listening = await findListeningById(id);
    if (!listening) {
      return null;
    }

    if (!canViewUnpublished && !listening.isPublished) {
      return null;
    }

    const neighbors = await findListeningNeighbors(
      { sequence: listening.sequence, createdAt: listening.createdAt },
      { canViewUnpublished },
    );

    return {
      listening: toListeningDetail(listening),
      previousId: neighbors.previousId,
      nextId: neighbors.nextId,
    };
  },
);

export async function createListening(
  input: ListeningInput,
): Promise<ListeningDetail> {
  await requireAdminUser();
  await requireCategory("listening", input.categoryId);

  try {
    const listening = await createListeningRecord({
      title: input.title,
      categoryId: input.categoryId,
      sequence: input.sequence,
      isPublished: input.isPublished,
      items: input.items,
    });

    return toListeningDetail(listening);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A listening with this title already exists.",
    );
  }
}

export async function updateListening(
  id: string,
  input: ListeningInput,
): Promise<ListeningDetail> {
  await requireAdminUser();
  await requireCategory("listening", input.categoryId);

  const existing = await findListeningById(id);
  if (!existing) {
    throw new ApiError(404, "Listening is not found.");
  }

  try {
    const listening = await updateListeningRecord(id, {
      title: input.title,
      categoryId: input.categoryId,
      sequence: input.sequence,
      isPublished: input.isPublished,
      items: input.items,
    });

    return toListeningDetail(listening);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A listening with this title already exists.",
    );
  }
}

export async function deleteListening(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findListeningById(id);
  if (!existing) {
    throw new ApiError(404, "Listening is not found.");
  }

  await deleteListeningRecord(id);
}
