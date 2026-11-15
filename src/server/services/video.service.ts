import { cache } from "react";
import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { VideoInput } from "@/lib/validations/video";
import {
  createVideo as createVideoRecord,
  deleteVideo as deleteVideoRecord,
  findNextVideoSequence,
  findVideoById,
  findVideoBySlugOrId,
  findVideoNeighbors,
  findVideoPage,
  updateVideo as updateVideoRecord,
  type VideoSelected,
} from "@/server/repositories/video.repository";
import { requireAdminUser, canViewUnpublishedContent } from "@/server/services/auth.service";
import {
  getCategoryOptions,
  getManagedCategories,
  requireCategory,
} from "@/server/services/category.service";
import type {
  VideoFilterParams,
  VideoPageResult,
} from "@/server/types/video";
import type {
  VideoItem,
  VideoNavigation,
} from "@/types/video";

export const VIDEO_PAGE_SIZE = 20;

function toVideoItem(
  video: VideoSelected,
): VideoItem {
  return {
    id: video.id,
    title: video.title,
    slug: video.slug,
    link: video.link,
    sequence: video.sequence,
    isPublished: video.isPublished,
    categoryId: video.categoryId,
    categoryName: video.category.name,
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
  };
}

export async function listVideos(
  query: VideoFilterParams,
): Promise<VideoPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  // Drafts are an admin-only view, and the gate runs inside the SQL query.
  const canViewUnpublished = await canViewUnpublishedContent();

  const [list, nextSequence, categories, categoryRows] = await Promise.all([
    findVideoPage({
      ...query,
      canViewUnpublished,
      search: query.search?.trim() || undefined,
      categoryId: query.categoryId?.trim() || undefined,
    }),
    findNextVideoSequence(),
    getCategoryOptions("video"),
    // Usage counts cover drafts, so only an admin is given the management rows.
    canViewUnpublished
      ? getManagedCategories("video")
      : Promise.resolve([]),
  ]);

  return { ...list, nextSequence, categories, categoryRows };
}

// generateMetadata and the page read the same row, so one request shares one read.
export const getVideoWithNavigation = cache(
  async (slugOrId: string): Promise<VideoNavigation | null> => {
    // Neighbours move with every saved row, so never prerender this.
    await connection();

    const canViewUnpublished = await canViewUnpublishedContent();

    const video = await findVideoBySlugOrId(slugOrId);
    if (!video) {
      return null;
    }

    if (!canViewUnpublished && !video.isPublished) {
      return null;
    }

    const neighbors = await findVideoNeighbors(
      {
        sequence: video.sequence,
        createdAt: video.createdAt,
      },
      { canViewUnpublished },
    );

    return {
      video: toVideoItem(video),
      previousSlug: neighbors.previousSlug,
      nextSlug: neighbors.nextSlug,
    };
  },
);

export async function createVideo(
  input: VideoInput,
): Promise<VideoItem> {
  await requireAdminUser();
  await requireCategory("video", input.categoryId);

  try {
    const video = await createVideoRecord(input);
    return toVideoItem(video);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A video with this title already exists.",
    );
  }
}

export async function updateVideo(
  id: string,
  input: VideoInput,
): Promise<VideoItem> {
  await requireAdminUser();
  await requireCategory("video", input.categoryId);

  const existing = await findVideoById(id);
  if (!existing) {
    throw new ApiError(404, "Video is not found.");
  }

  try {
    const video = await updateVideoRecord(id, input);
    return toVideoItem(video);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A video with this title already exists.",
    );
  }
}

export async function deleteVideo(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findVideoById(id);
  if (!existing) {
    throw new ApiError(404, "Video is not found.");
  }

  await deleteVideoRecord(id);
}
