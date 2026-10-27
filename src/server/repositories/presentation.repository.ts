import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  PresentationFilterParams,
  PresentationListResult,
  PresentationRow,
} from "@/server/types/presentation";

interface PresentationWriteData {
  title: string;
  text: string;
  sequence: number;
}

/**
 * Title search and pagination run in PostgreSQL; only the requested page of
 * rows is fetched.
 */
export async function findPresentationPage(
  filters: PresentationFilterParams
): Promise<PresentationListResult> {
  const where: Prisma.PresentationWhereInput = {};

  if (filters.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.presentation.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const presentations = await prisma.presentation.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    skip,
    take: pageSize,
  });

  const items = presentations.map<PresentationRow>((presentation) => ({
    id: presentation.id,
    title: presentation.title,
    text: presentation.text,
    sequence: presentation.sequence,
    createdAt: presentation.createdAt.toISOString(),
    updatedAt: presentation.updatedAt.toISOString(),
  }));

  return { items, pagination };
}

export async function findNextPresentationSequence(): Promise<number> {
  const latest = await prisma.presentation.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findPresentationById(id: string) {
  return prisma.presentation.findUnique({ where: { id } });
}

export function countPresentations() {
  return prisma.presentation.count();
}

export function createPresentation(data: PresentationWriteData) {
  return prisma.presentation.create({ data });
}

export function updatePresentation(id: string, data: PresentationWriteData) {
  return prisma.presentation.update({ where: { id }, data });
}

export function deletePresentation(id: string) {
  return prisma.presentation.delete({ where: { id } });
}
