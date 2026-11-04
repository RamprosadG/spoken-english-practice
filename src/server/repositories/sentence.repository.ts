import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  SentenceFilterParams,
  SentenceListResult,
  SentenceRow,
} from "@/server/types/sentence";

interface SentenceWriteData {
  text: string;
  meaning: string;
  categoryId: string;
  sequence: number;
  isPublished: boolean;
}

/** Every read that reaches the browser carries the category name with it. */
const SENTENCE_SELECT = {
  id: true,
  text: true,
  meaning: true,
  sequence: true,
  isPublished: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
} as const;

export type SentenceSelected = Prisma.SentenceGetPayload<{
  select: typeof SENTENCE_SELECT;
}>;

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
    sequence: sentence.sequence,
    isPublished: sentence.isPublished,
    categoryId: sentence.categoryId,
    categoryName: sentence.category.name,
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

export function createSentence(data: SentenceWriteData) {
  return prisma.sentence.create({ data, select: SENTENCE_SELECT });
}

export function updateSentence(id: string, data: SentenceWriteData) {
  return prisma.sentence.update({
    where: { id },
    data,
    select: SENTENCE_SELECT,
  });
}

export function deleteSentence(id: string) {
  return prisma.sentence.delete({ where: { id } });
}
