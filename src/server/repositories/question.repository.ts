import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere, type PublicationView } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import type { QuestionDifficulty } from "@/types/question";
import type {
  QuestionFilterParams,
  QuestionListResult,
  QuestionNeighbors,
  QuestionRow,
} from "@/server/types/question";

interface QuestionWriteData {
  question: string;
  answer: string;
  difficulty: QuestionDifficulty;
  categoryId: string;
  topicId: string;
  sequence: number;
  isPublished: boolean;
}

interface QuestionCursor {
  sequence: number;
  createdAt: Date;
}

/** Every read that reaches the browser carries both group names with it. */
const QUESTION_SELECT = {
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

export type QuestionSelected =
  Prisma.QuestionGetPayload<{
    select: typeof QUESTION_SELECT;
  }>;

function toRow(
  question: QuestionSelected,
): QuestionRow {
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
export async function findQuestionPage(
  filters: QuestionFilterParams,
): Promise<QuestionListResult> {
  const where: Prisma.QuestionWhereInput = {
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
  const total = await prisma.question.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const questions = await prisma.question.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: QUESTION_SELECT,
    skip,
    take: pageSize,
  });

  return { items: questions.map(toRow), pagination };
}

export function countQuestions() {
  return prisma.question.count();
}

export async function findNextQuestionSequence(): Promise<number> {
  const latest = await prisma.question.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findQuestionById(id: string) {
  return prisma.question.findUnique({
    where: { id },
    select: QUESTION_SELECT,
  });
}

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table.
 */
export async function findQuestionNeighbors(
  cursor: QuestionCursor,
  view: PublicationView,
): Promise<QuestionNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.question.findFirst({
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
    prisma.question.findFirst({
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

export function createQuestion(data: QuestionWriteData) {
  return prisma.question.create({
    data,
    select: QUESTION_SELECT,
  });
}

export function updateQuestion(
  id: string,
  data: QuestionWriteData,
) {
  return prisma.question.update({
    where: { id },
    data,
    select: QUESTION_SELECT,
  });
}

export function deleteQuestion(id: string) {
  return prisma.question.delete({ where: { id } });
}
