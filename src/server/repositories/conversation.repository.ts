import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
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
  sequence: number;
  lines: string[];
}

interface ConversationCursor {
  sequence: number;
  createdAt: Date;
}

export type ConversationWithLines = Prisma.ConversationGetPayload<{
  include: { lines: true };
}>;

const lineOrder: Prisma.ConversationLineOrderByWithRelationInput[] = [
  { sequence: "asc" },
  { createdAt: "asc" },
];

const conversationInclude = {
  lines: { orderBy: lineOrder },
} satisfies Prisma.ConversationInclude;

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
  const where: Prisma.ConversationWhereInput = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { speaker1: { contains: filters.search, mode: "insensitive" } },
      { speaker2: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.conversation.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
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

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table.
 */
export async function findConversationNeighbors(
  cursor: ConversationCursor,
): Promise<ConversationNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.conversation.findFirst({
      where: {
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
        sequence: data.sequence,
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
        sequence: data.sequence,
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
