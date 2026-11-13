import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere, type PublicationView } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  PresentationFilterParams,
  PresentationListResult,
  PresentationNeighbors,
  PresentationRow,
} from "@/server/types/presentation";

interface PresentationWriteData {
  title: string;
  text: string;
  categoryId: string;
  sequence: number;
  isPublished: boolean;
}

interface PresentationCursor {
  sequence: number;
  createdAt: Date;
}

/** Every read that reaches the browser carries the category name with it. */
const PRESENTATION_SELECT = {
  id: true,
  title: true,
  text: true,
  sequence: true,
  isPublished: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
} as const;

export type PresentationSelected = Prisma.PresentationGetPayload<{
  select: typeof PRESENTATION_SELECT;
}>;

/**
 * Title search, category filter and pagination run in PostgreSQL; only the
 * requested page of rows is fetched.
 */
export async function findPresentationPage(
  filters: PresentationFilterParams
): Promise<PresentationListResult> {
  const where: Prisma.PresentationWhereInput = {
    ...publicationWhere(filters),
  };

  if (filters.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.presentation.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const presentations = await prisma.presentation.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: PRESENTATION_SELECT,
    skip,
    take: pageSize,
  });

  const items = presentations.map<PresentationRow>((presentation) => ({
    id: presentation.id,
    title: presentation.title,
    text: presentation.text,
    sequence: presentation.sequence,
    isPublished: presentation.isPublished,
    categoryId: presentation.categoryId,
    categoryName: presentation.category.name,
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
  return prisma.presentation.findUnique({
    where: { id },
    select: PRESENTATION_SELECT,
  });
}

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table and
 * never steps a learner into a draft.
 */
export async function findPresentationNeighbors(
  cursor: PresentationCursor,
  view: PublicationView,
): Promise<PresentationNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.presentation.findFirst({
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
    prisma.presentation.findFirst({
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

export function countPresentations() {
  return prisma.presentation.count();
}

/** A crawler is a signed-out reader, so the sitemap lists published rows only. */
export function findPresentationSitemapRows() {
  return prisma.presentation.findMany({
    where: publicationWhere({ canViewUnpublished: false }),
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: { id: true, updatedAt: true },
  });
}

export function createPresentation(data: PresentationWriteData) {
  return prisma.presentation.create({ data, select: PRESENTATION_SELECT });
}

export function updatePresentation(id: string, data: PresentationWriteData) {
  return prisma.presentation.update({
    where: { id },
    data,
    select: PRESENTATION_SELECT,
  });
}

export function deletePresentation(id: string) {
  return prisma.presentation.delete({ where: { id } });
}
