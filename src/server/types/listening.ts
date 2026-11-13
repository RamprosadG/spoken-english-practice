import type { PublicationView } from "@/lib/publishing";
import type { CategoryOption, CategoryRow } from "@/server/types/category";
import type { PaginationMeta } from "./pagination";

export interface ListeningFilterParams extends PublicationView {
  search?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
}

export interface ListeningRow {
  id: string;
  title: string;
  slug: string;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningListResult {
  items: ListeningRow[];
  pagination: PaginationMeta;
}

export interface ListeningPageResult extends ListeningListResult {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}

export interface ListeningNeighbors {
  previousSlug: string | null;
  nextSlug: string | null;
}
