import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

/**
 * A listening is the parent row, so the client names it `Listening` and reserves
 * `ListeningItem` for the sentences the learner dictates. The payload field is
 * `items` for the same reason.
 */
export interface Listening {
  id: string;
  title: string;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningItem {
  id: string;
  text: string;
  sequence: number;
}

export interface ListeningDetail extends Listening {
  items: ListeningItem[];
}

/** The practice route walks sideways through the library, one listening at a time. */
export interface ListeningNavigation {
  listening: ListeningDetail;
  previousId: string | null;
  nextId: string | null;
}

export interface ListeningFilters {
  search: string;
  category: string;
  status: string;
  page: number;
}

export interface ListeningListData {
  listenings: Listening[];
  pagination: PaginationMeta | null;
  filters: ListeningFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}
