import { cache } from "react";
import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { SentenceInput } from "@/lib/validations/sentence";
import {
  createSentence as createSentenceRecord,
  deleteSentence as deleteSentenceRecord,
  findNextSentenceSequence,
  findSentenceById,
  findSentenceNeighbors,
  findSentencePage,
  updateSentence as updateSentenceRecord,
  type SentenceSelected,
} from "@/server/repositories/sentence.repository";
import { canViewUnpublishedContent, requireAdminUser } from "@/server/services/auth.service";
import {
  getCategoryOptions,
  getManagedCategories,
  requireCategory,
} from "@/server/services/category.service";
import type {
  SentenceFilterParams,
  SentencePageResult,
} from "@/server/types/sentence";
import type { SentenceItem, SentenceNavigation } from "@/types/sentence";

export const SENTENCE_PAGE_SIZE = 20;

function toSentenceItem(sentence: SentenceSelected): SentenceItem {
  return {
    id: sentence.id,
    text: sentence.text,
    meaning: sentence.meaning,
    whenToUse: sentence.whenToUse,
    sequence: sentence.sequence,
    isPublished: sentence.isPublished,
    categoryId: sentence.categoryId,
    categoryName: sentence.category.name,
    alternates: sentence.alternates,
    createdAt: sentence.createdAt.toISOString(),
    updatedAt: sentence.updatedAt.toISOString(),
  };
}

export async function listSentences(
  query: SentenceFilterParams,
): Promise<SentencePageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  // Drafts are an admin-only view, and the gate runs inside the SQL query.
  const canViewUnpublished = await canViewUnpublishedContent();

  const [list, nextSequence, categories, categoryRows] = await Promise.all([
    findSentencePage({
      ...query,
      canViewUnpublished,
      search: query.search?.trim() || undefined,
      categoryId: query.categoryId?.trim() || undefined,
    }),
    findNextSentenceSequence(),
    getCategoryOptions("sentence"),
    // Usage counts cover drafts, so only an admin is given the management rows.
    canViewUnpublished
      ? getManagedCategories("sentence")
      : Promise.resolve([]),
  ]);

  return { ...list, nextSequence, categories, categoryRows };
}

// generateMetadata and the page read the same row, so one request shares one read.
export const getSentenceWithNavigation = cache(
  async (id: string): Promise<SentenceNavigation | null> => {
    // Neighbours move with every saved row, so never prerender this.
    await connection();

    const canViewUnpublished = await canViewUnpublishedContent();

    const sentence = await findSentenceById(id);
    if (!sentence) {
      return null;
    }

    if (!canViewUnpublished && !sentence.isPublished) {
      return null;
    }

    const neighbors = await findSentenceNeighbors(
      {
        sequence: sentence.sequence,
        createdAt: sentence.createdAt,
      },
      { canViewUnpublished },
    );

    return {
      sentence: toSentenceItem(sentence),
      previousId: neighbors.previousId,
      nextId: neighbors.nextId,
    };
  },
);

export async function createSentence(
  input: SentenceInput,
): Promise<SentenceItem> {
  await requireAdminUser();
  await requireCategory("sentence", input.categoryId);

  try {
    const sentence = await createSentenceRecord(input);
    return toSentenceItem(sentence);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A sentence with this text already exists.",
    );
  }
}

export async function updateSentence(
  id: string,
  input: SentenceInput,
): Promise<SentenceItem> {
  await requireAdminUser();
  await requireCategory("sentence", input.categoryId);

  const existing = await findSentenceById(id);
  if (!existing) {
    throw new ApiError(404, "Sentence is not found.");
  }

  try {
    const sentence = await updateSentenceRecord(id, input);
    return toSentenceItem(sentence);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A sentence with this text already exists.",
    );
  }
}

export async function deleteSentence(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findSentenceById(id);
  if (!existing) {
    throw new ApiError(404, "Sentence is not found.");
  }

  await deleteSentenceRecord(id);
}
