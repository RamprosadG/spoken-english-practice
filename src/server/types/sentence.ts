import type { PublicationView } from "@/lib/publishing";
import type { CategoryOption, CategoryRow } from "@/server/types/category";
import type { PaginationMeta } from "./pagination";

export interface SentenceFilterParams extends PublicationView {
  search?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
}

export interface SentenceAlternateRow {
  id: string;
  text: string;
  sequence: number;
}

export interface SentenceRow {
  id: string;
  text: string;
  meaning: string;
  whenToUse: string | null;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  alternates: SentenceAlternateRow[];
  createdAt: string;
  updatedAt: string;
}

export interface SentenceListResult {
  items: SentenceRow[];
  pagination: PaginationMeta;
}

export interface SentencePageResult extends SentenceListResult {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}
