import type { PaginationMeta } from "@/server/types/pagination";

export interface PresentationItem {
  id: string;
  title: string;
  text: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationFilters {
  search: string;
  page: number;
}

export interface PresentationListData {
  presentations: PresentationItem[];
  pagination: PaginationMeta | null;
  filters: PresentationFilters;
  nextSequence: number;
}
