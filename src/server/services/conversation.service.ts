import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { ConversationInput } from "@/lib/validations/conversation";
import {
  createConversation as createConversationRecord,
  deleteConversation as deleteConversationRecord,
  findConversationById,
  findConversationNeighbors,
  findConversationPage,
  findNextConversationSequence,
  updateConversation as updateConversationRecord,
  type ConversationWithLines,
} from "@/server/repositories/conversation.repository";
import { requireAdminUser } from "@/server/services/auth.service";
import type {
  ConversationFilterParams,
  ConversationPageResult,
} from "@/server/types/conversation";
import type {
  ConversationDetailItem,
  ConversationItem,
  ConversationLineItem,
  ConversationNavigation,
  ConversationSpeaker,
} from "@/types/conversation";

export const CONVERSATION_PAGE_SIZE = 20;

/**
 * Turn one is always the odd sequence, so the two speakers alternate without a
 * speaker column on the line.
 */
function toLineItem(line: ConversationWithLines["lines"][number]): ConversationLineItem {
  const speaker: ConversationSpeaker = line.sequence % 2 === 1 ? "one" : "two";

  return {
    id: line.id,
    text: line.text,
    sequence: line.sequence,
    speaker,
  };
}

function toConversationItem(conversation: ConversationWithLines): ConversationItem {
  return {
    id: conversation.id,
    title: conversation.title,
    speaker1: conversation.speaker1,
    speaker2: conversation.speaker2,
    description: conversation.description,
    sequence: conversation.sequence,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

function toConversationDetail(
  conversation: ConversationWithLines,
): ConversationDetailItem {
  return {
    ...toConversationItem(conversation),
    lines: conversation.lines.map(toLineItem),
  };
}

export async function listConversations(
  query: ConversationFilterParams,
): Promise<ConversationPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  const [list, nextSequence] = await Promise.all([
    findConversationPage({
      ...query,
      search: query.search?.trim() || undefined,
    }),
    findNextConversationSequence(),
  ]);

  return { ...list, nextSequence };
}

export async function getConversationDetail(
  id: string,
): Promise<ConversationDetailItem> {
  await connection();

  const conversation = await findConversationById(id);
  if (!conversation) {
    throw new ApiError(404, "Conversation is not found.");
  }

  return toConversationDetail(conversation);
}

export async function getConversationWithNavigation(
  id: string,
): Promise<ConversationNavigation | null> {
  // Neighbours move with every saved row, so never prerender this.
  await connection();

  const conversation = await findConversationById(id);
  if (!conversation) {
    return null;
  }

  const neighbors = await findConversationNeighbors({
    sequence: conversation.sequence,
    createdAt: conversation.createdAt,
  });

  return {
    conversation: toConversationDetail(conversation),
    previousId: neighbors.previousId,
    nextId: neighbors.nextId,
  };
}

export async function createConversation(
  input: ConversationInput,
): Promise<ConversationDetailItem> {
  await requireAdminUser();

  try {
    const conversation = await createConversationRecord({
      title: input.title,
      speaker1: input.speaker1,
      speaker2: input.speaker2,
      description: input.description,
      sequence: input.sequence,
      lines: input.lines,
    });

    return toConversationDetail(conversation);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A conversation with this title already exists.",
    );
  }
}

export async function updateConversation(
  id: string,
  input: ConversationInput,
): Promise<ConversationDetailItem> {
  await requireAdminUser();

  const existing = await findConversationById(id);
  if (!existing) {
    throw new ApiError(404, "Conversation is not found.");
  }

  try {
    const conversation = await updateConversationRecord(id, {
      title: input.title,
      speaker1: input.speaker1,
      speaker2: input.speaker2,
      description: input.description,
      sequence: input.sequence,
      lines: input.lines,
    });

    return toConversationDetail(conversation);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A conversation with this title already exists.",
    );
  }
}

export async function deleteConversation(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findConversationById(id);
  if (!existing) {
    throw new ApiError(404, "Conversation is not found.");
  }

  await deleteConversationRecord(id);
}
