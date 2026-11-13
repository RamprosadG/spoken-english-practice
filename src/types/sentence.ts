import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

export interface SentenceAlternateItem {
  id: string;
  text: string;
  sequence: number;
}

export interface SentenceItem {
  id: string;
  text: string;
  slug: string;
  meaning: string;
  whenToUse: string | null;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  alternates: SentenceAlternateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SentenceFilters {
  search: string;
  category: string;
  status: string;
  page: number;
}

export interface SentenceNavigation {
  sentence: SentenceItem;
  previousSlug: string | null;
  nextSlug: string | null;
}

export interface SentenceListData {
  sentences: SentenceItem[];
  pagination: PaginationMeta | null;
  filters: SentenceFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}
