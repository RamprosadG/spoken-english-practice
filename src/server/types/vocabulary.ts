import type { PublicationView } from "@/lib/publishing";
import type { CategoryOption, CategoryRow } from "@/server/types/category";
import type { VocabularyPartsOfSpeech } from "@/types/vocabulary";
import type { PaginationMeta } from "./pagination";

export interface VocabularyFilterParams extends PublicationView {
  search?: string;
  letter?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
}

/** One row of `vocabulary_synonym` or `vocabulary_antonym`. */
export interface VocabularyRelatedWordRow {
  id: string;
  word: string;
  sentence: string;
  sequence: number;
}

export interface VocabularyRow {
  id: string;
  text: string;
  slug: string;
  meaning: string;
  sentence: string;
  sentenceMeaning: string;
  sequence: number;
  isPublished: boolean;
  partsOfSpeech: VocabularyPartsOfSpeech;
  categoryId: string;
  categoryName: string;
  synonyms: VocabularyRelatedWordRow[];
  antonyms: VocabularyRelatedWordRow[];
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyListResult {
  items: VocabularyRow[];
  pagination: PaginationMeta;
}

export interface VocabularyPageResult extends VocabularyListResult {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}

export interface VocabularyNeighbors {
  previousSlug: string | null;
  nextSlug: string | null;
}
