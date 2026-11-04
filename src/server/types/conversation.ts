import type { PublicationView } from "@/lib/publishing";
import type { CategoryOption, CategoryRow } from "@/server/types/category";
import type { PaginationMeta } from "./pagination";

export interface ConversationFilterParams extends PublicationView {
  search?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
}

export interface ConversationRow {
  id: string;
  title: string;
  speaker1: string;
  speaker2: string;
  description: string;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResult {
  items: ConversationRow[];
  pagination: PaginationMeta;
}

export interface ConversationPageResult extends ConversationListResult {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}

export interface ConversationNeighbors {
  previousId: string | null;
  nextId: string | null;
}
