import { connection } from "next/server";
import {
  PRESENTATION_PAGE_SIZE,
  listPresentations,
} from "@/server/services/presentation.service";
import type {
  PresentationFilters,
  PresentationListData,
} from "@/types/presentation";
import { PresentationView } from "./PresentationView";

const emptyData: PresentationListData = {
  presentations: [],
  pagination: null,
  filters: { search: "", page: 1 },
  nextSequence: 1,
};

export function PresentationLoading() {
  return <PresentationView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>,
): PresentationFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);

  return {
    search: typeof query.search === "string" ? query.search : "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface PresentationContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function PresentationContent({
  searchParams,
}: PresentationContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listPresentations({
    search: filters.search || undefined,
    page: filters.page,
    pageSize: PRESENTATION_PAGE_SIZE,
  });

  const data: PresentationListData = {
    presentations: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
  };

  return <PresentationView data={data} />;
}
