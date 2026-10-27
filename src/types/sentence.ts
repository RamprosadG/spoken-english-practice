import type { PaginationMeta } from "@/server/types/pagination";

export interface SentenceItem {
  id: string;
  text: string;
  meaning: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface SentenceFilters {
  search: string;
  page: number;
}

export interface SentenceListData {
  sentences: SentenceItem[];
  pagination: PaginationMeta | null;
  filters: SentenceFilters;
  nextSequence: number;
}
