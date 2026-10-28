import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { SentenceInput } from "@/lib/validations/sentence";
import {
  createSentence as createSentenceRecord,
  deleteSentence as deleteSentenceRecord,
  findNextSentenceSequence,
  findSentenceById,
  findSentencePage,
  updateSentence as updateSentenceRecord,
} from "@/server/repositories/sentence.repository";
import { requireAdminUser } from "@/server/services/auth.service";
import type {
  SentenceFilterParams,
  SentencePageResult,
} from "@/server/types/sentence";
import type { SentenceItem } from "@/types/sentence";

export const SENTENCE_PAGE_SIZE = 20;

interface SentenceRecord {
  id: string;
  text: string;
  meaning: string;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

function toSentenceItem(sentence: SentenceRecord): SentenceItem {
  return {
    id: sentence.id,
    text: sentence.text,
    meaning: sentence.meaning,
    sequence: sentence.sequence,
    createdAt: sentence.createdAt.toISOString(),
    updatedAt: sentence.updatedAt.toISOString(),
  };
}

export async function listSentences(
  query: SentenceFilterParams,
): Promise<SentencePageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  const [list, nextSequence] = await Promise.all([
    findSentencePage({
      ...query,
      search: query.search?.trim() || undefined,
    }),
    findNextSentenceSequence(),
  ]);

  return { ...list, nextSequence };
}

export async function createSentence(
  input: SentenceInput,
): Promise<SentenceItem> {
  await requireAdminUser();

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
