import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere, type PublicationView } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  SentenceFilterParams,
  SentenceListResult,
  SentenceNeighbors,
  SentenceRow,
} from "@/server/types/sentence";

interface SentenceWriteData {
  text: string;
  meaning: string;
  whenToUse: string | null;
  categoryId: string;
  sequence: number;
  isPublished: boolean;
  alternates: string[];
}

interface SentenceCursor {
  sequence: number;
  createdAt: Date;
}

/**
 * Every read that reaches the browser carries the category name and the
 * alternates with it: the edit modal and the practice page are both seeded
 * straight from the row, so neither needs a second fetch.
 */
const SENTENCE_SELECT = {
  id: true,
  text: true,
  meaning: true,
  whenToUse: true,
  sequence: true,
  isPublished: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
  // The edit modal is seeded from the list row, so the alternates ride along.
  alternates: {
    orderBy: { sequence: "asc" },
    select: { id: true, text: true, sequence: true },
  },
} as const;

export type SentenceSelected = Prisma.SentenceGetPayload<{
  select: typeof SENTENCE_SELECT;
}>;

/** Array position becomes the stored alternate sequence, one-based. */
function toAlternateRows(alternates: string[]) {
  return alternates.map((text, index) => ({ text, sequence: index + 1 }));
}

/**
 * Search and pagination run in PostgreSQL; only the requested page of rows is
 * fetched. The search covers both the English sentence and its meaning, and
 * unpublished rows are filtered out in the same statement.
 */
export async function findSentencePage(
  filters: SentenceFilterParams
): Promise<SentenceListResult> {
  const where: Prisma.SentenceWhereInput = {
    ...publicationWhere(filters),
  };

  if (filters.search) {
    where.OR = [
      { text: { contains: filters.search, mode: "insensitive" } },
      { meaning: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.sentence.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const sentences = await prisma.sentence.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: SENTENCE_SELECT,
    skip,
    take: pageSize,
  });

  const items = sentences.map<SentenceRow>((sentence) => ({
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
  }));

  return { items, pagination };
}

export async function findNextSentenceSequence(): Promise<number> {
  const latest = await prisma.sentence.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findSentenceById(id: string) {
  return prisma.sentence.findUnique({
    where: { id },
    select: SENTENCE_SELECT,
  });
}

export function countSentences() {
  return prisma.sentence.count();
}

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table and
 * never steps a learner into a draft.
 */
export async function findSentenceNeighbors(
  cursor: SentenceCursor,
  view: PublicationView,
): Promise<SentenceNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.sentence.findFirst({
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
    prisma.sentence.findFirst({
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

export function createSentence(data: SentenceWriteData) {
  return prisma.sentence.create({
    data: {
      text: data.text,
      meaning: data.meaning,
      whenToUse: data.whenToUse,
      categoryId: data.categoryId,
      sequence: data.sequence,
      isPublished: data.isPublished,
      alternates: { create: toAlternateRows(data.alternates) },
    },
    select: SENTENCE_SELECT,
  });
}

/**
 * Alternates are rewritten from scratch on every save: the incoming array is
 * the whole truth, so diffing by id would only add a failure mode.
 */
export function updateSentence(id: string, data: SentenceWriteData) {
  return prisma.sentence.update({
    where: { id },
    data: {
      text: data.text,
      meaning: data.meaning,
      whenToUse: data.whenToUse,
      categoryId: data.categoryId,
      sequence: data.sequence,
      isPublished: data.isPublished,
      alternates: {
        deleteMany: {},
        create: toAlternateRows(data.alternates),
      },
    },
    select: SENTENCE_SELECT,
  });
}

export function deleteSentence(id: string) {
  return prisma.sentence.delete({ where: { id } });
}
