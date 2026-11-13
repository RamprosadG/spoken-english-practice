import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere, type PublicationView } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type {
  ConversationFilterParams,
  ConversationListResult,
  ConversationNeighbors,
  ConversationRow,
} from "@/server/types/conversation";

interface ConversationWriteData {
  title: string;
  speaker1: string;
  speaker2: string;
  description: string;
  categoryId: string;
  sequence: number;
  isPublished: boolean;
  lines: string[];
}

interface ConversationCursor {
  sequence: number;
  createdAt: Date;
}

const lineOrder: Prisma.ConversationLineOrderByWithRelationInput[] = [
  { sequence: "asc" },
  { createdAt: "asc" },
];

const conversationInclude = {
  lines: { orderBy: lineOrder },
  category: { select: { name: true } },
} satisfies Prisma.ConversationInclude;

export type ConversationWithLines = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

/** The library table needs the category name but never the child lines. */
const CONVERSATION_LIST_SELECT = {
  id: true,
  title: true,
  speaker1: true,
  speaker2: true,
  description: true,
  sequence: true,
  isPublished: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
} as const;

/** Array position becomes the stored turn sequence, one-based. */
function toLineRows(lines: string[]) {
  return lines.map((text, index) => ({ text, sequence: index + 1 }));
}

/**
 * Search, filtering and pagination all run in PostgreSQL; only the requested
 * page of rows is fetched, and never the child lines.
 */
export async function findConversationPage(
  filters: ConversationFilterParams,
): Promise<ConversationListResult> {
  const where: Prisma.ConversationWhereInput = {
    ...publicationWhere(filters),
  };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { speaker1: { contains: filters.search, mode: "insensitive" } },
      { speaker2: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.conversation.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: CONVERSATION_LIST_SELECT,
    skip,
    take: pageSize,
  });

  const items = conversations.map<ConversationRow>((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    speaker1: conversation.speaker1,
    speaker2: conversation.speaker2,
    description: conversation.description,
    sequence: conversation.sequence,
    isPublished: conversation.isPublished,
    categoryId: conversation.categoryId,
    categoryName: conversation.category.name,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  }));

  return { items, pagination };
}

export async function findNextConversationSequence(): Promise<number> {
  const latest = await prisma.conversation.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: conversationInclude,
  });
}

export function countConversations() {
  return prisma.conversation.count();
}

/** A crawler is a signed-out reader, so the sitemap lists published rows only. */
export function findConversationSitemapRows() {
  return prisma.conversation.findMany({
    where: publicationWhere({ canViewUnpublished: false }),
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: { id: true, updatedAt: true },
  });
}

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table and
 * never steps a learner into a draft.
 */
export async function findConversationNeighbors(
  cursor: ConversationCursor,
  view: PublicationView,
): Promise<ConversationNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.conversation.findFirst({
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
    prisma.conversation.findFirst({
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

export function createConversation(data: ConversationWriteData) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.conversation.create({
      data: {
        title: data.title,
        speaker1: data.speaker1,
        speaker2: data.speaker2,
        description: data.description,
        categoryId: data.categoryId,
        sequence: data.sequence,
        isPublished: data.isPublished,
        lines: { create: toLineRows(data.lines) },
      },
    });

    return tx.conversation.findUniqueOrThrow({
      where: { id: created.id },
      include: conversationInclude,
    });
  });
}

/**
 * Turns are rewritten from scratch on every save: the incoming array order is
 * the whole truth, so diffing by id would only add a failure mode.
 */
export function updateConversation(id: string, data: ConversationWriteData) {
  return prisma.$transaction(async (tx) => {
    await tx.conversation.update({
      where: { id },
      data: {
        title: data.title,
        speaker1: data.speaker1,
        speaker2: data.speaker2,
        description: data.description,
        categoryId: data.categoryId,
        sequence: data.sequence,
        isPublished: data.isPublished,
        lines: {
          deleteMany: {},
          create: toLineRows(data.lines),
        },
      },
    });

    return tx.conversation.findUniqueOrThrow({
      where: { id },
      include: conversationInclude,
    });
  });
}

export function deleteConversation(id: string) {
  return prisma.conversation.delete({ where: { id } });
}
