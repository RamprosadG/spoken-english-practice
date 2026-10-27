import { connection } from "next/server";
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
  filters: { search: "", letter: "", page: 1 },
  nextSequence: 1,
};

export function VocabularyLoading() {
  return <VocabularyView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>,
): VocabularyFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);
  const rawLetter = Array.isArray(query.letter) ? query.letter[0] : query.letter;
  const letter =
    typeof rawLetter === "string" && /^[a-z]$/i.test(rawLetter)
      ? rawLetter.toUpperCase()
      : "";

  return {
    search: typeof query.search === "string" ? query.search : "",
    letter,
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
    letter: filters.letter || undefined,
    page: filters.page,
    pageSize: VOCABULARY_PAGE_SIZE,
  });

  const data: VocabularyListData = {
    vocabularies: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
  };

  return <VocabularyView data={data} />;
}
