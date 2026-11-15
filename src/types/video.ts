import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

export interface VideoItem {
  id: string;
  title: string;
  slug: string;
  link: string;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoFilters {
  search: string;
  category: string;
  status: string;
  page: number;
}

export interface VideoNavigation {
  video: VideoItem;
  previousSlug: string | null;
  nextSlug: string | null;
}

export interface VideoListData {
  videos: VideoItem[];
  pagination: PaginationMeta | null;
  filters: VideoFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}
