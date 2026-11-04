import { connection } from "next/server";
import { parsePublicationStatus } from "@/lib/publishing";
import {
  CONVERSATION_PAGE_SIZE,
  listConversations,
} from "@/server/services/conversation.service";
import type {
  ConversationFilters,
  ConversationListData,
} from "@/types/conversation";
import { ConversationView } from "./ConversationView";

const emptyData: ConversationListData = {
  conversations: [],
  pagination: null,
  filters: { search: "", status: "", page: 1 },
  nextSequence: 1,
};

export function ConversationLoading() {
  return <ConversationView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>,
): ConversationFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);
  const rawStatus = Array.isArray(query.status) ? query.status[0] : query.status;

  return {
    search: typeof query.search === "string" ? query.search : "",
    status: typeof rawStatus === "string" ? rawStatus : "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface ConversationContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function ConversationContent({
  searchParams,
}: ConversationContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listConversations({
    search: filters.search || undefined,
    status: parsePublicationStatus(filters.status),
    page: filters.page,
    pageSize: CONVERSATION_PAGE_SIZE,
  });

  const data: ConversationListData = {
    conversations: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
  };

  return <ConversationView data={data} />;
}
