import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  ListeningFilterParams,
  ListeningListResult,
  ListeningRow,
} from "@/server/types/listening";

interface ListeningWriteData {
  title: string;
  categoryId: string;
  sequence: number;
  isPublished: boolean;
  items: string[];
}

const itemOrder: Prisma.ListeningItemOrderByWithRelationInput[] = [
  { sequence: "asc" },
  { createdAt: "asc" },
];

const listeningInclude = {
  items: { orderBy: itemOrder },
  category: { select: { name: true } },
} satisfies Prisma.ListeningInclude;

export type ListeningWithItems = Prisma.ListeningGetPayload<{
  include: typeof listeningInclude;
}>;

/** The library table needs the category name and how much to practise, never the sentences. */
const LISTENING_LIST_SELECT = {
  id: true,
  title: true,
  sequence: true,
  isPublished: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
  _count: { select: { items: true } },
} as const;

/** Array position becomes the stored item sequence, one-based. */
function toItemRows(items: string[]) {
  return items.map((text, index) => ({ text, sequence: index + 1 }));
}

/**
 * Search, filtering and pagination all run in PostgreSQL; only the requested
 * page of rows is fetched, and the sentences are counted in SQL rather than
 * loaded.
 */
export async function findListeningPage(
  filters: ListeningFilterParams,
): Promise<ListeningListResult> {
  const where: Prisma.ListeningWhereInput = {
    ...publicationWhere(filters),
  };

  if (filters.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.listening.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const listenings = await prisma.listening.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: LISTENING_LIST_SELECT,
    skip,
    take: pageSize,
  });

  const items = listenings.map<ListeningRow>((listening) => ({
    id: listening.id,
    title: listening.title,
    sequence: listening.sequence,
    isPublished: listening.isPublished,
    categoryId: listening.categoryId,
    categoryName: listening.category.name,
    itemCount: listening._count.items,
    createdAt: listening.createdAt.toISOString(),
    updatedAt: listening.updatedAt.toISOString(),
  }));

  return { items, pagination };
}

export async function findNextListeningSequence(): Promise<number> {
  const latest = await prisma.listening.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findListeningById(id: string) {
  return prisma.listening.findUnique({
    where: { id },
    include: listeningInclude,
  });
}

export function countListenings() {
  return prisma.listening.count();
}

export function createListening(data: ListeningWriteData) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.listening.create({
      data: {
        title: data.title,
        categoryId: data.categoryId,
        sequence: data.sequence,
        isPublished: data.isPublished,
        items: { create: toItemRows(data.items) },
      },
    });

    return tx.listening.findUniqueOrThrow({
      where: { id: created.id },
      include: listeningInclude,
    });
  });
}

/**
 * Sentences are rewritten from scratch on every save: the incoming array order
 * is the whole truth, so diffing by id would only add a failure mode.
 */
export function updateListening(id: string, data: ListeningWriteData) {
  return prisma.$transaction(async (tx) => {
    await tx.listening.update({
      where: { id },
      data: {
        title: data.title,
        categoryId: data.categoryId,
        sequence: data.sequence,
        isPublished: data.isPublished,
        items: {
          deleteMany: {},
          create: toItemRows(data.items),
        },
      },
    });

    return tx.listening.findUniqueOrThrow({
      where: { id },
      include: listeningInclude,
    });
  });
}

export function deleteListening(id: string) {
  return prisma.listening.delete({ where: { id } });
}
