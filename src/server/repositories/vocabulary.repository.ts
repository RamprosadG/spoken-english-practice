import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  VocabularyFilterParams,
  VocabularyListResult,
  VocabularyRow,
} from "@/server/types/vocabulary";

interface VocabularyWriteData {
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
}

/**
 * Search, the A-Z letter filter and pagination all run in PostgreSQL. The
 * search covers the word, synonym and antonym only; the letter filter applies
 * to the vocabulary word itself.
 */
export async function findVocabularyPage(
  filters: VocabularyFilterParams
): Promise<VocabularyListResult> {
  const where: Prisma.VocabularyWhereInput = {};

  if (filters.letter) {
    where.text = { startsWith: filters.letter, mode: "insensitive" };
  }

  if (filters.search) {
    where.OR = [
      { text: { contains: filters.search, mode: "insensitive" } },
      { synonymText: { contains: filters.search, mode: "insensitive" } },
      { antonymText: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.vocabulary.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const vocabularies = await prisma.vocabulary.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    skip,
    take: pageSize,
  });

  const items = vocabularies.map<VocabularyRow>((vocabulary) => ({
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
  }));

  return { items, pagination };
}

export async function findNextVocabularySequence(): Promise<number> {
  const latest = await prisma.vocabulary.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findVocabularyById(id: string) {
  return prisma.vocabulary.findUnique({ where: { id } });
}

export function countVocabulary() {
  return prisma.vocabulary.count();
}

export function createVocabulary(data: VocabularyWriteData) {
  return prisma.vocabulary.create({ data });
}

export function updateVocabulary(id: string, data: VocabularyWriteData) {
  return prisma.vocabulary.update({ where: { id }, data });
}

export function deleteVocabulary(id: string) {
  return prisma.vocabulary.delete({ where: { id } });
}
