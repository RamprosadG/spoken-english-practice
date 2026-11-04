import type { PaginationMeta } from "@/server/types/pagination";

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
  isPublished: boolean;
  partsOfSpeech: VocabularyPartsOfSpeech;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyFilters {
  search: string;
  letter: string;
  status: string;
  page: number;
}

export interface VocabularyListData {
  vocabularies: VocabularyItem[];
  pagination: PaginationMeta | null;
  filters: VocabularyFilters;
  nextSequence: number;
}
