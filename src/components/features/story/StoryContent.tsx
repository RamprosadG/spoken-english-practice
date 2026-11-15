import { connection } from "next/server";
import { parsePublicationStatus } from "@/lib/publishing";
import { STORY_PAGE_SIZE, listStories } from "@/server/services/story.service";
import type { StoryFilters, StoryListData } from "@/types/story";
import { StoryView } from "./StoryView";

const emptyData: StoryListData = {
  stories: [],
  pagination: null,
  filters: { search: "", category: "", status: "", page: 1 },
  nextSequence: 1,
  categories: [],
  categoryRows: [],
};

export function StoryLoading() {
  return <StoryView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>,
): StoryFilters {
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

interface StoryContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function StoryContent({ searchParams }: StoryContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listStories({
    search: filters.search || undefined,
    categoryId: filters.category || undefined,
    status: parsePublicationStatus(filters.status),
    page: filters.page,
    pageSize: STORY_PAGE_SIZE,
  });

  const data: StoryListData = {
    stories: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
    categories: list.categories,
    categoryRows: list.categoryRows,
  };

  return <StoryView data={data} />;
}