import type { PaginationMeta } from "./pagination";

export interface PresentationFilterParams {
  search?: string;
  page: number;
  pageSize: number;
}

export interface PresentationRow {
  id: string;
  title: string;
  text: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationListResult {
  items: PresentationRow[];
  pagination: PaginationMeta;
}

export interface PresentationPageResult extends PresentationListResult {
  nextSequence: number;
}
