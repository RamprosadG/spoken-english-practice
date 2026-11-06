import { connection } from "next/server";
import { parsePublicationStatus } from "@/lib/publishing";
import {
  INTERVIEW_QUESTION_PAGE_SIZE,
  listInterviewQuestions,
} from "@/server/services/interview-question.service";
import { parseInterviewDifficulty } from "@/types/interview-question";
import type {
  InterviewQuestionFilters,
  InterviewQuestionListData,
} from "@/types/interview-question";
import { InterviewQuestionView } from "./InterviewQuestionView";

const emptyData: InterviewQuestionListData = {
  questions: [],
  pagination: null,
  filters: {
    search: "",
    category: "",
    topic: "",
    difficulty: "",
    status: "",
    page: 1,
  },
  nextSequence: 1,
  categories: [],
  categoryRows: [],
  topics: [],
  topicRows: [],
};

export function InterviewQuestionLoading() {
  return <InterviewQuestionView data={emptyData} isLoading />;
}

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(query: SearchParams, key: string): string {
  const value = Array.isArray(query[key]) ? query[key][0] : query[key];
  return typeof value === "string" ? value : "";
}

function readFilters(query: SearchParams): InterviewQuestionFilters {
  const rawPage = Number(readParam(query, "page"));

  return {
    search: readParam(query, "search"),
    category: readParam(query, "category"),
    topic: readParam(query, "topic"),
    difficulty: readParam(query, "difficulty"),
    status: readParam(query, "status"),
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface InterviewQuestionContentProps {
  searchParams: Promise<SearchParams>;
}

export async function InterviewQuestionContent({
  searchParams,
}: InterviewQuestionContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listInterviewQuestions({
    search: filters.search || undefined,
    categoryId: filters.category || undefined,
    topicId: filters.topic || undefined,
    difficulty: parseInterviewDifficulty(filters.difficulty),
    status: parsePublicationStatus(filters.status),
    page: filters.page,
    pageSize: INTERVIEW_QUESTION_PAGE_SIZE,
  });

  const data: InterviewQuestionListData = {
    questions: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
    categories: list.categories,
    categoryRows: list.categoryRows,
    topics: list.topics,
    topicRows: list.topicRows,
  };

  return <InterviewQuestionView data={data} />;
}
