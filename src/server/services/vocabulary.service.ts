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
} from "@/server/repositories/vocabulary.repository";
import { requireAdminUser } from "@/server/services/auth.service";
import type {
  VocabularyFilterParams,
  VocabularyPageResult,
} from "@/server/types/vocabulary";
import type { VocabularyItem } from "@/types/vocabulary";

export const VOCABULARY_PAGE_SIZE = 20;

interface VocabularyRecord {
  id: string;
  text: string;
  meaning: string;
  sentence: string;
  sentenceMeaning: string;
  synonymText: string | null;
  synonymMeaning: string | null;
  synonymSentence: string | null;
  synonymSentenceMeaning: string | null;
  antonymText: string | null;
  antonymMeaning: string | null;
  antonymSentence: string | null;
  antonymSentenceMeaning: string | null;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

function toVocabularyItem(vocabulary: VocabularyRecord): VocabularyItem {
  return {
    id: vocabulary.id,
    text: vocabulary.text,
    meaning: vocabulary.meaning,
    sentence: vocabulary.sentence,
    sentenceMeaning: vocabulary.sentenceMeaning,
    synonymText: vocabulary.synonymText,
    synonymMeaning: vocabulary.synonymMeaning,
    synonymSentence: vocabulary.synonymSentence,
    synonymSentenceMeaning: vocabulary.synonymSentenceMeaning,
    antonymText: vocabulary.antonymText,
    antonymMeaning: vocabulary.antonymMeaning,
    antonymSentence: vocabulary.antonymSentence,
    antonymSentenceMeaning: vocabulary.antonymSentenceMeaning,
    sequence: vocabulary.sequence,
    createdAt: vocabulary.createdAt.toISOString(),
    updatedAt: vocabulary.updatedAt.toISOString(),
  };
}

export async function listVocabulary(
  query: VocabularyFilterParams,
): Promise<VocabularyPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  const letter = query.letter?.trim().toUpperCase();

  const [list, nextSequence] = await Promise.all([
    findVocabularyPage({
      ...query,
      search: query.search?.trim() || undefined,
      letter: letter && /^[A-Z]$/.test(letter) ? letter : undefined,
    }),
    findNextVocabularySequence(),
  ]);

  return { ...list, nextSequence };
}

export async function createVocabulary(
  input: VocabularyInput,
): Promise<VocabularyItem> {
  await requireAdminUser();

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
