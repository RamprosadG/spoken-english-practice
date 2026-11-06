import { connection } from "next/server";
import { parsePublicationStatus } from "@/lib/publishing";
import {
  VOCABULARY_PAGE_SIZE,
  listVocabulary,
} from "@/server/services/vocabulary.service";
import type {
  VocabularyFilters,
  VocabularyListData,
} from "@/types/vocabulary";
import { VocabularyView } from "./VocabularyView";

const emptyData: VocabularyListData = {
  vocabularies: [],
  pagination: null,
  filters: { search: "", category: "", letter: "", status: "", page: 1 },
  nextSequence: 1,
  categories: [],
  categoryRows: [],
};

export function VocabularyLoading() {
  return <VocabularyView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>,
): VocabularyFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);
  const rawLetter = Array.isArray(query.letter) ? query.letter[0] : query.letter;
  const rawStatus = Array.isArray(query.status) ? query.status[0] : query.status;
  const rawCategory = Array.isArray(query.category)
    ? query.category[0]
    : query.category;
  const letter =
    typeof rawLetter === "string" && /^[a-z]$/i.test(rawLetter)
      ? rawLetter.toUpperCase()
      : "";

  return {
    search: typeof query.search === "string" ? query.search : "",
    category: typeof rawCategory === "string" ? rawCategory : "",
    letter,
    status: typeof rawStatus === "string" ? rawStatus : "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface VocabularyContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function VocabularyContent({
  searchParams,
}: VocabularyContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listVocabulary({
    search: filters.search || undefined,
    categoryId: filters.category || undefined,
    letter: filters.letter || undefined,
    status: parsePublicationStatus(filters.status),
    page: filters.page,
    pageSize: VOCABULARY_PAGE_SIZE,
  });

  const data: VocabularyListData = {
    vocabularies: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
    categories: list.categories,
    categoryRows: list.categoryRows,
  };

  return <VocabularyView data={data} />;
}
