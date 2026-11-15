import type { PublicationView } from "@/lib/publishing";
import type { CategoryOption, CategoryRow } from "@/server/types/category";
import type { PaginationMeta } from "./pagination";

export interface VideoFilterParams extends PublicationView {
  search?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
}

export interface VideoRow {
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

export interface VideoListResult {
  items: VideoRow[];
  pagination: PaginationMeta;
}

export interface VideoPageResult extends VideoListResult {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}

export interface VideoNeighbors {
  previousSlug: string | null;
  nextSlug: string | null;
}
