import type { PublicationView } from "@/lib/publishing";
import type { PaginationMeta } from "./pagination";

export interface PresentationFilterParams extends PublicationView {
  search?: string;
  page: number;
  pageSize: number;
}

export interface PresentationRow {
  id: string;
  title: string;
  text: string;
  sequence: number;
  isPublished: boolean;
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

export interface PresentationNeighbors {
  previousId: string | null;
  nextId: string | null;
}
