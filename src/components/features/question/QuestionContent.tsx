import { connection } from "next/server";
import { parsePublicationStatus } from "@/lib/publishing";
import {
  QUESTION_PAGE_SIZE,
  listQuestions,
} from "@/server/services/question.service";
import { parseQuestionDifficulty } from "@/types/question";
import type {
  QuestionFilters,
  QuestionListData,
} from "@/types/question";
import { QuestionView } from "./QuestionView";

const emptyData: QuestionListData = {
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

export function QuestionLoading() {
  return <QuestionView data={emptyData} isLoading />;
}

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(query: SearchParams, key: string): string {
  const value = Array.isArray(query[key]) ? query[key][0] : query[key];
  return typeof value === "string" ? value : "";
}

function readFilters(query: SearchParams): QuestionFilters {
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

interface QuestionContentProps {
  searchParams: Promise<SearchParams>;
}

export async function QuestionContent({
  searchParams,
}: QuestionContentProps) {
  // Mark this region as request-time before any URL read, so the library is
  // never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listQuestions({
    search: filters.search || undefined,
    categoryId: filters.category || undefined,
    topicId: filters.topic || undefined,
    difficulty: parseQuestionDifficulty(filters.difficulty),
    status: parsePublicationStatus(filters.status),
    page: filters.page,
    pageSize: QUESTION_PAGE_SIZE,
  });

  const data: QuestionListData = {
    questions: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
    nextSequence: list.nextSequence,
    categories: list.categories,
    categoryRows: list.categoryRows,
    topics: list.topics,
    topicRows: list.topicRows,
  };

  return <QuestionView data={data} />;
}
