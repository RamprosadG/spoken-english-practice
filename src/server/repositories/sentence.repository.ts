import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  SentenceFilterParams,
  SentenceListResult,
  SentenceRow,
} from "@/server/types/sentence";

interface SentenceWriteData {
  text: string;
  meaning: string;
  sequence: number;
}

/**
 * Search and pagination run in PostgreSQL; only the requested page of rows is
 * fetched. The search covers both the English sentence and its meaning.
 */
export async function findSentencePage(
  filters: SentenceFilterParams
): Promise<SentenceListResult> {
  const where: Prisma.SentenceWhereInput = {};

  if (filters.search) {
    where.OR = [
      { text: { contains: filters.search, mode: "insensitive" } },
      { meaning: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.sentence.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const sentences = await prisma.sentence.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    skip,
    take: pageSize,
  });

  const items = sentences.map<SentenceRow>((sentence) => ({
    id: sentence.id,
    text: sentence.text,
    meaning: sentence.meaning,
    sequence: sentence.sequence,
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
  return prisma.sentence.findUnique({ where: { id } });
}

export function countSentences() {
  return prisma.sentence.count();
}

export function createSentence(data: SentenceWriteData) {
  return prisma.sentence.create({ data });
}

export function updateSentence(id: string, data: SentenceWriteData) {
  return prisma.sentence.update({ where: { id }, data });
}

export function deleteSentence(id: string) {
  return prisma.sentence.delete({ where: { id } });
}
