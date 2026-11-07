import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

/** The eight school-standard parts of speech, stored and sent lowercase. */
export const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
] as const;

export type VocabularyPartsOfSpeech = (typeof PARTS_OF_SPEECH)[number];

export const PARTS_OF_SPEECH_OPTIONS = PARTS_OF_SPEECH.map((partOfSpeech) => ({
  value: partOfSpeech,
  label: partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1),
}));

/** One synonym or antonym row — the word, its example, and the saved order. */
export interface VocabularyRelatedWord {
  id: string;
  word: string;
  sentence: string;
  sequence: number;
}

export interface VocabularyItem {
  id: string;
  text: string;
  meaning: string;
  sentence: string;
  sentenceMeaning: string;
  sequence: number;
  isPublished: boolean;
  partsOfSpeech: VocabularyPartsOfSpeech;
  categoryId: string;
  categoryName: string;
  synonyms: VocabularyRelatedWord[];
  antonyms: VocabularyRelatedWord[];
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyFilters {
  search: string;
  category: string;
  letter: string;
  status: string;
  page: number;
}

export interface VocabularyNavigation {
  vocabulary: VocabularyItem;
  previousId: string | null;
  nextId: string | null;
}

export interface VocabularyListData {
  vocabularies: VocabularyItem[];
  pagination: PaginationMeta | null;
  filters: VocabularyFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}
