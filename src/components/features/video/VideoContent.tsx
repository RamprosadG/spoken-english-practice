import { connection } from "next/server";
import { parsePublicationStatus } from "@/lib/publishing";
import { VIDEO_PAGE_SIZE, listVideos } from "@/server/services/video.service";
import type { VideoFilters, VideoListData } from "@/types/video";
import { VideoView } from "./VideoView";

const emptyData: VideoListData = {
  videos: [],
  pagination: null,
  filters: { search: "", category: "", status: "", page: 1 },
  nextSequence: 1,
  categories: [],
  categoryRows: [],
};

export function VideoLoading() {
  return <VideoView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>,
): VideoFilters {
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

interface VideoContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function VideoContent({ searchParams }: VideoContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listVideos({
    search: filters.search || undefined,
    categoryId: filters.category || undefined,
    status: parsePublicationStatus(filters.status),
    page: filters.page,
    pageSize: VIDEO_PAGE_SIZE,
  });

  const data: VideoListData = {
    videos: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
    categories: list.categories,
    categoryRows: list.categoryRows,
  };

  return <VideoView data={data} />;
}
