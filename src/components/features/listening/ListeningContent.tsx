import { connection } from "next/server";
import { parsePublicationStatus } from "@/lib/publishing";
import {
  LISTENING_PAGE_SIZE,
  listListenings,
} from "@/server/services/listening.service";
import type { ListeningFilters, ListeningListData } from "@/types/listening";
import { ListeningView } from "./ListeningView";

const emptyData: ListeningListData = {
  listenings: [],
  pagination: null,
  filters: { search: "", category: "", status: "", page: 1 },
  nextSequence: 1,
  categories: [],
  categoryRows: [],
};

export function ListeningLoading() {
  return <ListeningView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>,
): ListeningFilters {
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

interface ListeningContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function ListeningContent({
  searchParams,
}: ListeningContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listListenings({
    search: filters.search || undefined,
    categoryId: filters.category || undefined,
    status: parsePublicationStatus(filters.status),
    page: filters.page,
    pageSize: LISTENING_PAGE_SIZE,
  });

  const data: ListeningListData = {
    listenings: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
    categories: list.categories,
    categoryRows: list.categoryRows,
  };

  return <ListeningView data={data} />;
}
