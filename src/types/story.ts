import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

export interface StoryItem {
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

export interface StoryFilters {
  search: string;
  category: string;
  status: string;
  page: number;
}

export interface StoryNavigation {
  story: StoryItem;
  previousSlug: string | null;
  nextSlug: string | null;
}

export interface StoryListData {
  stories: StoryItem[];
  pagination: PaginationMeta | null;
  filters: StoryFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}