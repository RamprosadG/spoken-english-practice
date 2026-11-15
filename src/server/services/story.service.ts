import { cache } from "react";
import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { StoryInput } from "@/lib/validations/story";
import {
  createStory as createStoryRecord,
  deleteStory as deleteStoryRecord,
  findNextStorySequence,
  findStoryById,
  findStoryBySlugOrId,
  findStoryNeighbors,
  findStoryPage,
  updateStory as updateStoryRecord,
  type StorySelected,
} from "@/server/repositories/story.repository";
import { requireAdminUser, canViewUnpublishedContent } from "@/server/services/auth.service";
import {
  getCategoryOptions,
  getManagedCategories,
  requireCategory,
} from "@/server/services/category.service";
import type {
  StoryFilterParams,
  StoryPageResult,
} from "@/server/types/story";
import type {
  StoryItem,
  StoryNavigation,
} from "@/types/story";

export const STORY_PAGE_SIZE = 20;

function toStoryItem(story: StorySelected): StoryItem {
  return {
    id: story.id,
    title: story.title,
    slug: story.slug,
    text: story.text,
    sequence: story.sequence,
    isPublished: story.isPublished,
    categoryId: story.categoryId,
    categoryName: story.category.name,
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
  };
}

export async function listStories(
  query: StoryFilterParams,
): Promise<StoryPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  // Drafts are an admin-only view, and the gate runs inside the SQL query.
  const canViewUnpublished = await canViewUnpublishedContent();

  const [list, nextSequence, categories, categoryRows] = await Promise.all([
    findStoryPage({
      ...query,
      canViewUnpublished,
      search: query.search?.trim() || undefined,
      categoryId: query.categoryId?.trim() || undefined,
    }),
    findNextStorySequence(),
    getCategoryOptions("story"),
    // Usage counts cover drafts, so only an admin is given the management rows.
    canViewUnpublished
      ? getManagedCategories("story")
      : Promise.resolve([]),
  ]);

  return { ...list, nextSequence, categories, categoryRows };
}

// generateMetadata and the page read the same row, so one request shares one read.
export const getStoryWithNavigation = cache(
  async (slugOrId: string): Promise<StoryNavigation | null> => {
    // Neighbours move with every saved row, so never prerender this.
    await connection();

    const canViewUnpublished = await canViewUnpublishedContent();

    const story = await findStoryBySlugOrId(slugOrId);
    if (!story) {
      return null;
    }

    if (!canViewUnpublished && !story.isPublished) {
      return null;
    }

    const neighbors = await findStoryNeighbors(
      {
        sequence: story.sequence,
        createdAt: story.createdAt,
      },
      { canViewUnpublished },
    );

    return {
      story: toStoryItem(story),
      previousSlug: neighbors.previousSlug,
      nextSlug: neighbors.nextSlug,
    };
  },
);

export async function createStory(input: StoryInput): Promise<StoryItem> {
  await requireAdminUser();
  await requireCategory("story", input.categoryId);

  try {
    const story = await createStoryRecord(input);
    return toStoryItem(story);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A story with this title already exists.",
    );
  }
}

export async function updateStory(
  id: string,
  input: StoryInput,
): Promise<StoryItem> {
  await requireAdminUser();
  await requireCategory("story", input.categoryId);

  const existing = await findStoryById(id);
  if (!existing) {
    throw new ApiError(404, "Story is not found.");
  }

  try {
    const story = await updateStoryRecord(id, input);
    return toStoryItem(story);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A story with this title already exists.",
    );
  }
}

export async function deleteStory(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findStoryById(id);
  if (!existing) {
    throw new ApiError(404, "Story is not found.");
  }

  await deleteStoryRecord(id);
}