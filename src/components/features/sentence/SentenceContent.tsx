import { connection } from "next/server";
import { parsePublicationStatus } from "@/lib/publishing";
import {
  SENTENCE_PAGE_SIZE,
  listSentences,
} from "@/server/services/sentence.service";
import type {
  SentenceFilters,
  SentenceListData,
} from "@/types/sentence";
import { SentenceView } from "./SentenceView";

const emptyData: SentenceListData = {
  sentences: [],
  pagination: null,
  filters: { search: "", category: "", status: "", page: 1 },
  nextSequence: 1,
  categories: [],
  categoryRows: [],
};

export function SentenceLoading() {
  return <SentenceView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>,
): SentenceFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);
  const rawStatus = Array.isArray(query.status) ? query.status[0] : query.status;
  const rawCategory = Array.isArray(query.category)
    ? query.category[0]
    : query.category;

  return {
    search: typeof query.search === "string" ? query.search : "",
    category: typeof rawCategory === "string" ? rawCategory : "",
    status: typeof rawStatus === "string" ? rawStatus : "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface SentenceContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function SentenceContent({
  searchParams,
}: SentenceContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listSentences({
    search: filters.search || undefined,
    categoryId: filters.category || undefined,
    status: parsePublicationStatus(filters.status),
    page: filters.page,
    pageSize: SENTENCE_PAGE_SIZE,
  });

  const data: SentenceListData = {
    sentences: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
    categories: list.categories,
    categoryRows: list.categoryRows,
  };

  return <SentenceView data={data} />;
}
