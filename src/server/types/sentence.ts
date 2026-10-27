import type { PaginationMeta } from "./pagination";

export interface SentenceFilterParams {
  search?: string;
  page: number;
  pageSize: number;
}

export interface SentenceRow {
  id: string;
  text: string;
  meaning: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface SentenceListResult {
  items: SentenceRow[];
  pagination: PaginationMeta;
}

export interface SentencePageResult extends SentenceListResult {
  nextSequence: number;
}
