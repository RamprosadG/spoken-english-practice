import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { InterviewQuestionInput } from "@/lib/validations/interview-question";
import {
  createInterviewQuestion as createInterviewQuestionRecord,
  deleteInterviewQuestion as deleteInterviewQuestionRecord,
  findInterviewQuestionById,
  findInterviewQuestionNeighbors,
  findInterviewQuestionPage,
  findNextInterviewQuestionSequence,
  updateInterviewQuestion as updateInterviewQuestionRecord,
  type InterviewQuestionSelected,
} from "@/server/repositories/interview-question.repository";
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
  InterviewQuestionFilterParams,
  InterviewQuestionPageResult,
} from "@/server/types/interview-question";
import type {
  InterviewQuestionItem,
  InterviewQuestionNavigation,
} from "@/types/interview-question";

export const INTERVIEW_QUESTION_PAGE_SIZE = 20;

const DUPLICATE_QUESTION_MESSAGE =
  "This interview question is already saved.";

function toInterviewQuestionItem(
  question: InterviewQuestionSelected,
): InterviewQuestionItem {
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
export async function canViewInterviewLibrary(): Promise<boolean> {
  return canViewUnpublishedContent();
}

export async function listInterviewQuestions(
  query: InterviewQuestionFilterParams,
): Promise<InterviewQuestionPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  if (!(await canViewInterviewLibrary())) {
    throw new ApiError(
      403,
      "You do not have permission to perform this action.",
    );
  }

  const [list, nextSequence, categories, categoryRows, topics, topicRows] =
    await Promise.all([
      findInterviewQuestionPage({
        ...query,
        canViewUnpublished: true,
        search: query.search?.trim() || undefined,
        categoryId: query.categoryId?.trim() || undefined,
        topicId: query.topicId?.trim() || undefined,
      }),
      findNextInterviewQuestionSequence(),
      getPublicCategoryOptions("interview"),
      getManagedCategories("interview"),
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
export async function getInterviewQuestionWithNavigation(
  id: string,
): Promise<InterviewQuestionNavigation | null> {
  // Neighbours move with every saved row, so never prerender this.
  await connection();

  if (!(await canViewInterviewLibrary())) {
    return null;
  }

  const question = await findInterviewQuestionById(id);
  if (!question) {
    return null;
  }

  const neighbors = await findInterviewQuestionNeighbors(
    {
      sequence: question.sequence,
      createdAt: question.createdAt,
    },
    { canViewUnpublished: true },
  );

  return {
    question: toInterviewQuestionItem(question),
    previousId: neighbors.previousId,
    nextId: neighbors.nextId,
  };
}

async function requireGroups(input: InterviewQuestionInput): Promise<void> {
  await requireCategory("interview", input.categoryId);
  await requireCategory("topic", input.topicId);
}

export async function createInterviewQuestion(
  input: InterviewQuestionInput,
): Promise<InterviewQuestionItem> {
  await requireAdminUser();
  await requireGroups(input);

  try {
    const question = await createInterviewQuestionRecord(input);
    return toInterviewQuestionItem(question);
  } catch (error) {
    throw uniqueViolationError(error, DUPLICATE_QUESTION_MESSAGE);
  }
}

export async function updateInterviewQuestion(
  id: string,
  input: InterviewQuestionInput,
): Promise<InterviewQuestionItem> {
  await requireAdminUser();
  await requireGroups(input);

  const existing = await findInterviewQuestionById(id);
  if (!existing) {
    throw new ApiError(404, "Interview question is not found.");
  }

  try {
    const question = await updateInterviewQuestionRecord(id, input);
    return toInterviewQuestionItem(question);
  } catch (error) {
    throw uniqueViolationError(error, DUPLICATE_QUESTION_MESSAGE);
  }
}

export async function deleteInterviewQuestion(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findInterviewQuestionById(id);
  if (!existing) {
    throw new ApiError(404, "Interview question is not found.");
  }

  await deleteInterviewQuestionRecord(id);
}
