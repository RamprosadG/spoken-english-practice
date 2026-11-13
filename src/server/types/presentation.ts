import type { PublicationView } from "@/lib/publishing";
import type { CategoryOption, CategoryRow } from "@/server/types/category";
import type { PaginationMeta } from "./pagination";

export interface PresentationFilterParams extends PublicationView {
  search?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
}

export interface PresentationRow {
  id: string;
  title: string;
  slug: string;
  text: string;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationListResult {
  items: PresentationRow[];
  pagination: PaginationMeta;
}

export interface PresentationPageResult extends PresentationListResult {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}

export interface PresentationNeighbors {
  previousSlug: string | null;
  nextSlug: string | null;
}
