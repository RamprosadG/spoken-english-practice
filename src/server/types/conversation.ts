import type { PaginationMeta } from "./pagination";

export interface ConversationFilterParams {
  search?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResult {
  items: ConversationRow[];
  pagination: PaginationMeta;
}

export interface ConversationPageResult extends ConversationListResult {
  nextSequence: number;
}

export interface ConversationNeighbors {
  previousId: string | null;
  nextId: string | null;
}
