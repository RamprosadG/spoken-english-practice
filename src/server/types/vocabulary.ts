import type { PublicationView } from "@/lib/publishing";
import type { VocabularyPartsOfSpeech } from "@/types/vocabulary";
import type { PaginationMeta } from "./pagination";

export interface VocabularyFilterParams extends PublicationView {
  search?: string;
  letter?: string;
  page: number;
  pageSize: number;
}

export interface VocabularyRow {
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
  isPublished: boolean;
  partsOfSpeech: VocabularyPartsOfSpeech;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyListResult {
  items: VocabularyRow[];
  pagination: PaginationMeta;
}

export interface VocabularyPageResult extends VocabularyListResult {
  nextSequence: number;
}
