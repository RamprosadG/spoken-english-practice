import type { PublicationView } from "@/lib/publishing";
import type { CategoryOption, CategoryRow } from "@/server/types/category";
import type { QuestionDifficulty } from "@/types/question";
import type { PaginationMeta } from "./pagination";

export interface QuestionFilterParams extends PublicationView {
  search?: string;
  categoryId?: string;
  topicId?: string;
  difficulty?: QuestionDifficulty;
  page: number;
  pageSize: number;
}

export interface QuestionRow {
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

export interface QuestionListResult {
  items: QuestionRow[];
  pagination: PaginationMeta;
}

export interface QuestionPageResult
  extends QuestionListResult {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
  topics: CategoryOption[];
  topicRows: CategoryRow[];
}

export interface QuestionNeighbors {
  previousId: string | null;
  nextId: string | null;
}
