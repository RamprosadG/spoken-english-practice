import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { QuestionInput } from "@/lib/validations/question";
import {
  createQuestion as createQuestionRecord,
  deleteQuestion as deleteQuestionRecord,
  findQuestionById,
  findQuestionNeighbors,
  findQuestionPage,
  findNextQuestionSequence,
  updateQuestion as updateQuestionRecord,
  type QuestionSelected,
} from "@/server/repositories/question.repository";
import {
  canViewUnpublishedContent,
  requireAdminUser,
} from "@/server/services/auth.service";
import {
  getManagedCategories,
  getPublicCategoryOptions,
  requireCategory,
} from "@/server/services/category.service";
import type {
  QuestionFilterParams,
  QuestionPageResult,
} from "@/server/types/question";
import type {
  QuestionItem,
  QuestionNavigation,
} from "@/types/question";

export const QUESTION_PAGE_SIZE = 20;

const DUPLICATE_QUESTION_MESSAGE =
  "This question is already saved.";

function toQuestionItem(
  question: QuestionSelected,
): QuestionItem {
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
 * Only an admin reaches this library, so the page and the route handlers share
 * one gate. `isPublished` is stored but not used for visibility yet — flipping
 * this function to `canViewUnpublishedContent()` is what makes it public.
 */
export async function canViewQuestionLibrary(): Promise<boolean> {
  return canViewUnpublishedContent();
}

export async function listQuestions(
  query: QuestionFilterParams,
): Promise<QuestionPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  if (!(await canViewQuestionLibrary())) {
    throw new ApiError(
      403,
      "You do not have permission to perform this action.",
    );
  }

  const [list, nextSequence, categories, categoryRows, topics, topicRows] =
    await Promise.all([
      findQuestionPage({
        ...query,
        canViewUnpublished: true,
        search: query.search?.trim() || undefined,
        categoryId: query.categoryId?.trim() || undefined,
        topicId: query.topicId?.trim() || undefined,
      }),
      findNextQuestionSequence(),
      getPublicCategoryOptions("question"),
      getManagedCategories("question"),
      getPublicCategoryOptions("topic"),
      getManagedCategories("topic"),
    ]);

  return {
    ...list,
    nextSequence,
    categories,
    categoryRows,
    topics,
    topicRows,
  };
}

/** Returns null for an unknown id and for a reader the library is closed to. */
export async function getQuestionWithNavigation(
  id: string,
): Promise<QuestionNavigation | null> {
  // Neighbours move with every saved row, so never prerender this.
  await connection();

  if (!(await canViewQuestionLibrary())) {
    return null;
  }

  const question = await findQuestionById(id);
  if (!question) {
    return null;
  }

  const neighbors = await findQuestionNeighbors(
    {
      sequence: question.sequence,
      createdAt: question.createdAt,
    },
    { canViewUnpublished: true },
  );

  return {
    question: toQuestionItem(question),
    previousId: neighbors.previousId,
    nextId: neighbors.nextId,
  };
}

async function requireGroups(input: QuestionInput): Promise<void> {
  await requireCategory("question", input.categoryId);
  await requireCategory("topic", input.topicId);
}

export async function createQuestion(
  input: QuestionInput,
): Promise<QuestionItem> {
  await requireAdminUser();
  await requireGroups(input);

  try {
    const question = await createQuestionRecord(input);
    return toQuestionItem(question);
  } catch (error) {
    throw uniqueViolationError(error, DUPLICATE_QUESTION_MESSAGE);
  }
}

export async function updateQuestion(
  id: string,
  input: QuestionInput,
): Promise<QuestionItem> {
  await requireAdminUser();
  await requireGroups(input);

  const existing = await findQuestionById(id);
  if (!existing) {
    throw new ApiError(404, "Question is not found.");
  }

  try {
    const question = await updateQuestionRecord(id, input);
    return toQuestionItem(question);
  } catch (error) {
    throw uniqueViolationError(error, DUPLICATE_QUESTION_MESSAGE);
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findQuestionById(id);
  if (!existing) {
    throw new ApiError(404, "Question is not found.");
  }

  await deleteQuestionRecord(id);
}
