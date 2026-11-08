import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere, type PublicationView } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type { InterviewQuestionDifficulty } from "@/types/interview-question";
import type {
  InterviewQuestionFilterParams,
  InterviewQuestionListResult,
  InterviewQuestionNeighbors,
  InterviewQuestionRow,
} from "@/server/types/interview-question";

interface InterviewQuestionWriteData {
  question: string;
  answer: string;
  difficulty: InterviewQuestionDifficulty;
  categoryId: string;
  topicId: string;
  sequence: number;
  isPublished: boolean;
}

interface InterviewQuestionCursor {
  sequence: number;
  createdAt: Date;
}

/** Every read that reaches the browser carries both group names with it. */
const INTERVIEW_QUESTION_SELECT = {
  id: true,
  question: true,
  answer: true,
  difficulty: true,
  sequence: true,
  isPublished: true,
  categoryId: true,
  topicId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
  topic: { select: { name: true } },
} as const;

export type InterviewQuestionSelected =
  Prisma.InterviewQuestionGetPayload<{
    select: typeof INTERVIEW_QUESTION_SELECT;
  }>;

function toRow(
  question: InterviewQuestionSelected,
): InterviewQuestionRow {
  return {
    id: question.id,
    question: question.question,
    answer: question.answer,
    difficulty: question.difficulty,
    sequence: question.sequence,
    isPublished: question.isPublished,
    categoryId: question.categoryId,
    categoryName: question.category.name,
    topicId: question.topicId,
    topicName: question.topic.name,
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
  };
}

/**
 * Search, the category, topic and difficulty filters and pagination all run in
 * PostgreSQL, so only the requested page of rows is fetched.
 */
export async function findInterviewQuestionPage(
  filters: InterviewQuestionFilterParams,
): Promise<InterviewQuestionListResult> {
  const where: Prisma.InterviewQuestionWhereInput = {
    ...publicationWhere(filters),
  };

  if (filters.search) {
    where.OR = [
      { question: { contains: filters.search, mode: "insensitive" } },
      { answer: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.topicId) {
    where.topicId = filters.topicId;
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.interviewQuestion.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const questions = await prisma.interviewQuestion.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: INTERVIEW_QUESTION_SELECT,
    skip,
    take: pageSize,
  });

  return { items: questions.map(toRow), pagination };
}

export function countInterviewQuestions() {
  return prisma.interviewQuestion.count();
}

export async function findNextInterviewQuestionSequence(): Promise<number> {
  const latest = await prisma.interviewQuestion.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findInterviewQuestionById(id: string) {
  return prisma.interviewQuestion.findUnique({
    where: { id },
    select: INTERVIEW_QUESTION_SELECT,
  });
}

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table.
 */
export async function findInterviewQuestionNeighbors(
  cursor: InterviewQuestionCursor,
  view: PublicationView,
): Promise<InterviewQuestionNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.interviewQuestion.findFirst({
      where: {
        ...publicationWhere(view),
        OR: [
          { sequence: { lt: cursor.sequence } },
          { sequence: cursor.sequence, createdAt: { lt: cursor.createdAt } },
        ],
      },
      orderBy: [{ sequence: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    }),
    prisma.interviewQuestion.findFirst({
      where: {
        ...publicationWhere(view),
        OR: [
          { sequence: { gt: cursor.sequence } },
          { sequence: cursor.sequence, createdAt: { gt: cursor.createdAt } },
        ],
      },
      orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
  ]);

  return {
    previousId: previous?.id ?? null,
    nextId: next?.id ?? null,
  };
}

export function createInterviewQuestion(data: InterviewQuestionWriteData) {
  return prisma.interviewQuestion.create({
    data,
    select: INTERVIEW_QUESTION_SELECT,
  });
}

export function updateInterviewQuestion(
  id: string,
  data: InterviewQuestionWriteData,
) {
  return prisma.interviewQuestion.update({
    where: { id },
    data,
    select: INTERVIEW_QUESTION_SELECT,
  });
}

export function deleteInterviewQuestion(id: string) {
  return prisma.interviewQuestion.delete({ where: { id } });
}
