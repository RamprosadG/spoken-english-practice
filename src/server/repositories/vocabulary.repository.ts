import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere, type PublicationView } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type { VocabularyPartsOfSpeech } from "@/types/vocabulary";
import type {
  VocabularyFilterParams,
  VocabularyListResult,
  VocabularyNeighbors,
  VocabularyRow,
} from "@/server/types/vocabulary";

interface RelatedWordInput {
  word: string;
  sentence: string;
}

interface VocabularyWriteData {
  text: string;
  meaning: string;
  sentence: string;
  sentenceMeaning: string;
  categoryId: string;
  sequence: number;
  isPublished: boolean;
  partsOfSpeech: VocabularyPartsOfSpeech;
  synonyms: RelatedWordInput[];
  antonyms: RelatedWordInput[];
}

interface VocabularyCursor {
  sequence: number;
  createdAt: Date;
}

const RELATIVE_WORD_SELECT = {
  id: true,
  word: true,
  sentence: true,
  sequence: true,
} as const;

/**
 * Every read that reaches the browser carries the category name and both related
 * word lists with it: the edit modal and the practice page are both seeded
 * straight from the row, so neither needs a second fetch.
 */
const VOCABULARY_SELECT = {
  id: true,
  text: true,
  meaning: true,
  sentence: true,
  sentenceMeaning: true,
  sequence: true,
  isPublished: true,
  partsOfSpeech: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
  synonyms: { orderBy: { sequence: "asc" }, select: RELATIVE_WORD_SELECT },
  antonyms: { orderBy: { sequence: "asc" }, select: RELATIVE_WORD_SELECT },
} as const;

export type VocabularySelected = Prisma.VocabularyGetPayload<{
  select: typeof VOCABULARY_SELECT;
}>;

/** Array position becomes the stored sequence, one-based. */
function toRelatedWordRows(words: RelatedWordInput[]) {
  return words.map((word, index) => ({ ...word, sequence: index + 1 }));
}

/**
 * Search, the A-Z letter filter and pagination all run in PostgreSQL. The
 * search covers the word and its example sentence, never a synonym or antonym;
 * the letter filter applies to the vocabulary word itself. Unpublished rows
 * never leave the database for a learner.
 */
export async function findVocabularyPage(
  filters: VocabularyFilterParams
): Promise<VocabularyListResult> {
  const where: Prisma.VocabularyWhereInput = {
    ...publicationWhere(filters),
  };

  if (filters.letter) {
    where.text = { startsWith: filters.letter, mode: "insensitive" };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.search) {
    where.OR = [
      { text: { contains: filters.search, mode: "insensitive" } },
      { sentence: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.vocabulary.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const vocabularies = await prisma.vocabulary.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: VOCABULARY_SELECT,
    skip,
    take: pageSize,
  });

  const items = vocabularies.map<VocabularyRow>((vocabulary) => ({
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
  return prisma.vocabulary.findUnique({
    where: { id },
    select: VOCABULARY_SELECT,
  });
}

export function countVocabulary() {
  return prisma.vocabulary.count();
}

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table and
 * never steps a learner into a draft.
 */
export async function findVocabularyNeighbors(
  cursor: VocabularyCursor,
  view: PublicationView,
): Promise<VocabularyNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.vocabulary.findFirst({
      where: {
        ...publicationWhere(view),
        OR: [
          { sequence: { lt: cursor.sequence } },
          { sequence: cursor.sequence, createdAt: { lt: cursor.createdAt } },
        ],
      },
      orderBy: [{ sequence: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    }),
    prisma.vocabulary.findFirst({
      where: {
        ...publicationWhere(view),
        OR: [
          { sequence: { gt: cursor.sequence } },
          { sequence: cursor.sequence, createdAt: { gt: cursor.createdAt } },
        ],
      },
      orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
  ]);

  return {
    previousId: previous?.id ?? null,
    nextId: next?.id ?? null,
  };
}

export function createVocabulary(data: VocabularyWriteData) {
  return prisma.vocabulary.create({
    data: {
      text: data.text,
      meaning: data.meaning,
      sentence: data.sentence,
      sentenceMeaning: data.sentenceMeaning,
      categoryId: data.categoryId,
      sequence: data.sequence,
      isPublished: data.isPublished,
      partsOfSpeech: data.partsOfSpeech,
      synonyms: { create: toRelatedWordRows(data.synonyms) },
      antonyms: { create: toRelatedWordRows(data.antonyms) },
    },
    select: VOCABULARY_SELECT,
  });
}

/**
 * Both lists are rewritten from scratch on every save: the incoming arrays are
 * the whole truth, so diffing by id would only add a failure mode.
 */
export function updateVocabulary(id: string, data: VocabularyWriteData) {
  return prisma.vocabulary.update({
    where: { id },
    data: {
      text: data.text,
      meaning: data.meaning,
      sentence: data.sentence,
      sentenceMeaning: data.sentenceMeaning,
      categoryId: data.categoryId,
      sequence: data.sequence,
      isPublished: data.isPublished,
      partsOfSpeech: data.partsOfSpeech,
      synonyms: {
        deleteMany: {},
        create: toRelatedWordRows(data.synonyms),
      },
      antonyms: {
        deleteMany: {},
        create: toRelatedWordRows(data.antonyms),
      },
    },
    select: VOCABULARY_SELECT,
  });
}

export function deleteVocabulary(id: string) {
  return prisma.vocabulary.delete({ where: { id } });
}
