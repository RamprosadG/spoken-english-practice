import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { VocabularyInput } from "@/lib/validations/vocabulary";
import {
  createVocabulary as createVocabularyRecord,
  deleteVocabulary as deleteVocabularyRecord,
  findNextVocabularySequence,
  findVocabularyById,
  findVocabularyPage,
  updateVocabulary as updateVocabularyRecord,
  type VocabularySelected,
} from "@/server/repositories/vocabulary.repository";
import { canViewUnpublishedContent, requireAdminUser } from "@/server/services/auth.service";
import {
  getCategoryOptions,
  getManagedCategories,
  requireCategory,
} from "@/server/services/category.service";
import type {
  VocabularyFilterParams,
  VocabularyPageResult,
} from "@/server/types/vocabulary";
import type { VocabularyItem } from "@/types/vocabulary";

export const VOCABULARY_PAGE_SIZE = 20;

function toVocabularyItem(vocabulary: VocabularySelected): VocabularyItem {
  return {
    id: vocabulary.id,
    text: vocabulary.text,
    meaning: vocabulary.meaning,
    sentence: vocabulary.sentence,
    sentenceMeaning: vocabulary.sentenceMeaning,
    sequence: vocabulary.sequence,
    isPublished: vocabulary.isPublished,
    partsOfSpeech: vocabulary.partsOfSpeech,
    categoryId: vocabulary.categoryId,
    categoryName: vocabulary.category.name,
    synonyms: vocabulary.synonyms,
    antonyms: vocabulary.antonyms,
    createdAt: vocabulary.createdAt.toISOString(),
    updatedAt: vocabulary.updatedAt.toISOString(),
  };
}

export async function listVocabulary(
  query: VocabularyFilterParams,
): Promise<VocabularyPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  // Drafts are an admin-only view, and the gate runs inside the SQL query.
  const canViewUnpublished = await canViewUnpublishedContent();

  const letter = query.letter?.trim().toUpperCase();

  const [list, nextSequence, categories, categoryRows] = await Promise.all([
    findVocabularyPage({
      ...query,
      canViewUnpublished,
      search: query.search?.trim() || undefined,
      categoryId: query.categoryId?.trim() || undefined,
      letter: letter && /^[A-Z]$/.test(letter) ? letter : undefined,
    }),
    findNextVocabularySequence(),
    getCategoryOptions("vocabulary"),
    // Usage counts cover drafts, so only an admin is given the management rows.
    canViewUnpublished
      ? getManagedCategories("vocabulary")
      : Promise.resolve([]),
  ]);

  return { ...list, nextSequence, categories, categoryRows };
}

export async function createVocabulary(
  input: VocabularyInput,
): Promise<VocabularyItem> {
  await requireAdminUser();
  await requireCategory("vocabulary", input.categoryId);

  try {
    const vocabulary = await createVocabularyRecord(input);
    return toVocabularyItem(vocabulary);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "This vocabulary word is already saved.",
    );
  }
}

export async function updateVocabulary(
  id: string,
  input: VocabularyInput,
): Promise<VocabularyItem> {
  await requireAdminUser();
  await requireCategory("vocabulary", input.categoryId);

  const existing = await findVocabularyById(id);
  if (!existing) {
    throw new ApiError(404, "Vocabulary is not found.");
  }

  try {
    const vocabulary = await updateVocabularyRecord(id, input);
    return toVocabularyItem(vocabulary);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "This vocabulary word is already saved.",
    );
  }
}

export async function deleteVocabulary(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findVocabularyById(id);
  if (!existing) {
    throw new ApiError(404, "Vocabulary is not found.");
  }

  await deleteVocabularyRecord(id);
}
