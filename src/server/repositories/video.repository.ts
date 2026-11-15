import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere, type PublicationView } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import { resolveSlug } from "@/lib/slug";
import type {
  VideoFilterParams,
  VideoListResult,
  VideoNeighbors,
  VideoRow,
} from "@/server/types/video";

interface VideoWriteData {
  title: string;
  link: string;
  categoryId: string;
  sequence: number;
  isPublished: boolean;
}

interface VideoCursor {
  sequence: number;
  createdAt: Date;
}

/** Every read that reaches the browser carries the category name with it. */
const VIDEO_SELECT = {
  id: true,
  title: true,
  slug: true,
  link: true,
  sequence: true,
  isPublished: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
} as const;

export type VideoSelected = Prisma.VideoGetPayload<{
  select: typeof VIDEO_SELECT;
}>;

/**
 * Title search, category filter and pagination run in PostgreSQL; only the
 * requested page of rows is fetched.
 */
export async function findVideoPage(
  filters: VideoFilterParams
): Promise<VideoListResult> {
  const where: Prisma.VideoWhereInput = {
    ...publicationWhere(filters),
  };

  if (filters.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.video.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const videos = await prisma.video.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: VIDEO_SELECT,
    skip,
    take: pageSize,
  });

  const items = videos.map<VideoRow>((video) => ({
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
  }));

  return { items, pagination };
}

export async function findNextVideoSequence(): Promise<number> {
  const latest = await prisma.video.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findVideoById(id: string) {
  return prisma.video.findUnique({
    where: { id },
    select: VIDEO_SELECT,
  });
}

// Resolve legacy UUIDs too, so the page can redirect them to the slug.
export function findVideoBySlugOrId(slugOrId: string) {
  return prisma.video.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    select: VIDEO_SELECT,
  });
}

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table and
 * never steps a learner into a draft.
 */
export async function findVideoNeighbors(
  cursor: VideoCursor,
  view: PublicationView,
): Promise<VideoNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.video.findFirst({
      where: {
        ...publicationWhere(view),
        OR: [
          { sequence: { lt: cursor.sequence } },
          { sequence: cursor.sequence, createdAt: { lt: cursor.createdAt } },
        ],
      },
      orderBy: [{ sequence: "desc" }, { createdAt: "desc" }],
      select: { slug: true },
    }),
    prisma.video.findFirst({
      where: {
        ...publicationWhere(view),
        OR: [
          { sequence: { gt: cursor.sequence } },
          { sequence: cursor.sequence, createdAt: { gt: cursor.createdAt } },
        ],
      },
      orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
      select: { slug: true },
    }),
  ]);

  return {
    previousSlug: previous?.slug ?? null,
    nextSlug: next?.slug ?? null,
  };
}

export function countVideos() {
  return prisma.video.count();
}

/** A crawler is a signed-out reader, so the sitemap lists published rows only. */
export function findVideoSitemapRows() {
  return prisma.video.findMany({
    where: publicationWhere({ canViewUnpublished: false }),
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: { slug: true, updatedAt: true },
  });
}

// Generate the public address only on create; edits must not break shared URLs.
export async function createVideo(data: VideoWriteData) {
  const slug = await resolveSlug(
    data.title,
    async (candidate) =>
      (await prisma.video.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })) !== null,
  );

  return prisma.video.create({
    data: {
      title: data.title,
      slug,
      link: data.link,
      categoryId: data.categoryId,
      sequence: data.sequence,
      isPublished: data.isPublished,
    },
    select: VIDEO_SELECT,
  });
}

export function updateVideo(id: string, data: VideoWriteData) {
  return prisma.video.update({
    where: { id },
    data,
    select: VIDEO_SELECT,
  });
}

export function deleteVideo(id: string) {
  return prisma.video.delete({ where: { id } });
}
