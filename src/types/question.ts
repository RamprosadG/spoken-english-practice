import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

/** The three self-rated levels of a question, stored and sent lowercase. */
export const QUESTION_DIFFICULTIES = [
  "beginner",
  "intermediate",
  "hard",
] as const;

export type QuestionDifficulty =
  (typeof QUESTION_DIFFICULTIES)[number];

export const QUESTION_DIFFICULTY_OPTIONS = QUESTION_DIFFICULTIES.map(
  (difficulty) => ({
    value: difficulty,
    label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
  }),
);

export const QUESTION_DIFFICULTY_FILTER_OPTIONS = [
  { value: "", label: "All Difficulty" },
  ...QUESTION_DIFFICULTY_OPTIONS,
];

export function parseQuestionDifficulty(
  value: string | undefined,
): QuestionDifficulty | undefined {
  return QUESTION_DIFFICULTIES.find((difficulty) => difficulty === value);
}

export interface QuestionItem {
  id: string;
  question: string;
  answer: string;
  difficulty: QuestionDifficulty;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  topicId: string;
  topicName: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFilters {
  search: string;
  category: string;
  topic: string;
  difficulty: string;
  status: string;
  page: number;
}

export interface QuestionNavigation {
  question: QuestionItem;
  previousId: string | null;
  nextId: string | null;
}

export interface QuestionListData {
  questions: QuestionItem[];
  pagination: PaginationMeta | null;
  filters: QuestionFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
  topics: CategoryOption[];
  topicRows: CategoryRow[];
}
