import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

/** Which of the two speakers owns a turn, derived from its sequence parity. */
export type ConversationSpeaker = "one" | "two";

export interface ConversationLineItem {
  id: string;
  text: string;
  sequence: number;
  speaker: ConversationSpeaker;
}

export interface ConversationItem {
  id: string;
  title: string;
  slug: string;
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

export interface ConversationDetailItem extends ConversationItem {
  lines: ConversationLineItem[];
}

export interface ConversationFilters {
  search: string;
  category: string;
  status: string;
  page: number;
}

export interface ConversationNavigation {
  conversation: ConversationDetailItem;
  previousSlug: string | null;
  nextSlug: string | null;
}

export interface ConversationListData {
  conversations: ConversationItem[];
  pagination: PaginationMeta | null;
  filters: ConversationFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}
