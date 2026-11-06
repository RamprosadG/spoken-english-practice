import type { PublicationView } from "@/lib/publishing";
import type { CategoryOption, CategoryRow } from "@/server/types/category";
import type { InterviewQuestionDifficulty } from "@/types/interview-question";
import type { PaginationMeta } from "./pagination";

export interface InterviewQuestionFilterParams extends PublicationView {
  search?: string;
  categoryId?: string;
  topicId?: string;
  difficulty?: InterviewQuestionDifficulty;
  page: number;
  pageSize: number;
}

export interface InterviewQuestionRow {
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

export interface InterviewQuestionListResult {
  items: InterviewQuestionRow[];
  pagination: PaginationMeta;
}

export interface InterviewQuestionPageResult
  extends InterviewQuestionListResult {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
  topics: CategoryOption[];
  topicRows: CategoryRow[];
}

export interface InterviewQuestionNeighbors {
  previousId: string | null;
  nextId: string | null;
}
