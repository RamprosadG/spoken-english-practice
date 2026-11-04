import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

export interface PresentationItem {
  id: string;
  title: string;
  text: string;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationFilters {
  search: string;
  category: string;
  status: string;
  page: number;
}

export interface PresentationNavigation {
  presentation: PresentationItem;
  previousId: string | null;
  nextId: string | null;
}

export interface PresentationListData {
  presentations: PresentationItem[];
  pagination: PaginationMeta | null;
  filters: PresentationFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}
