import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption, CategoryRow } from "@/server/types/category";

/** The three self-rated levels of an interview question, stored and sent lowercase. */
export const INTERVIEW_DIFFICULTIES = [
  "beginner",
  "intermediate",
  "hard",
] as const;

export type InterviewQuestionDifficulty =
  (typeof INTERVIEW_DIFFICULTIES)[number];

export const INTERVIEW_DIFFICULTY_OPTIONS = INTERVIEW_DIFFICULTIES.map(
  (difficulty) => ({
    value: difficulty,
    label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
  }),
);

export const INTERVIEW_DIFFICULTY_FILTER_OPTIONS = [
  { value: "", label: "All difficulties" },
  ...INTERVIEW_DIFFICULTY_OPTIONS,
];

export function parseInterviewDifficulty(
  value: string | undefined,
): InterviewQuestionDifficulty | undefined {
  return INTERVIEW_DIFFICULTIES.find((difficulty) => difficulty === value);
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  answer: string;
  difficulty: InterviewQuestionDifficulty;
  sequence: number;
  isPublished: boolean;
  categoryId: string;
  categoryName: string;
  topicId: string;
  topicName: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestionFilters {
  search: string;
  category: string;
  topic: string;
  difficulty: string;
  status: string;
  page: number;
}

export interface InterviewQuestionNavigation {
  question: InterviewQuestionItem;
  previousId: string | null;
  nextId: string | null;
}

export interface InterviewQuestionListData {
  questions: InterviewQuestionItem[];
  pagination: PaginationMeta | null;
  filters: InterviewQuestionFilters;
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
  topics: CategoryOption[];
  topicRows: CategoryRow[];
}
