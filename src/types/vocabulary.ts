import type { PaginationMeta } from "@/server/types/pagination";

export interface VocabularyItem {
  id: string;
  text: string;
  meaning: string;
  sentence: string;
  sentenceMeaning: string;
  synonymText: string | null;
  synonymMeaning: string | null;
  synonymSentence: string | null;
  synonymSentenceMeaning: string | null;
  antonymText: string | null;
  antonymMeaning: string | null;
  antonymSentence: string | null;
  antonymSentenceMeaning: string | null;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyFilters {
  search: string;
  letter: string;
  page: number;
}

export interface VocabularyListData {
  vocabularies: VocabularyItem[];
  pagination: PaginationMeta | null;
  filters: VocabularyFilters;
  nextSequence: number;
}
