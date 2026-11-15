import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { publicationWhere, type PublicationView } from "@/lib/publishing";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import { resolveSlug } from "@/lib/slug";
import type {
  StoryFilterParams,
  StoryListResult,
  StoryNeighbors,
  StoryRow,
} from "@/server/types/story";

interface StoryWriteData {
  title: string;
  text: string;
  categoryId: string;
  sequence: number;
  isPublished: boolean;
}

interface StoryCursor {
  sequence: number;
  createdAt: Date;
}

/** Every read that reaches the browser carries the category name with it. */
const STORY_SELECT = {
  id: true,
  title: true,
  slug: true,
  text: true,
  sequence: true,
  isPublished: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
} as const;

export type StorySelected = Prisma.StoryGetPayload<{
  select: typeof STORY_SELECT;
}>;

/**
 * Title search, category filter and pagination run in PostgreSQL; only the
 * requested page of rows is fetched.
 */
export async function findStoryPage(
  filters: StoryFilterParams
): Promise<StoryListResult> {
  const where: Prisma.StoryWhereInput = {
    ...publicationWhere(filters),
  };

  if (filters.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.story.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const stories = await prisma.story.findMany({
    where,
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: STORY_SELECT,
    skip,
    take: pageSize,
  });

  const items = stories.map<StoryRow>((story) => ({
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
  }));

  return { items, pagination };
}

export async function findNextStorySequence(): Promise<number> {
  const latest = await prisma.story.findFirst({
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });

  return (latest?.sequence ?? 0) + 1;
}

export function findStoryById(id: string) {
  return prisma.story.findUnique({
    where: { id },
    select: STORY_SELECT,
  });
}

// Resolve legacy UUIDs too, so the page can redirect them to the slug.
export function findStoryBySlugOrId(slugOrId: string) {
  return prisma.story.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    select: STORY_SELECT,
  });
}

/**
 * Neighbours are the closest rows on each side of this cursor in the list
 * order (sequence, then createdAt), so the walk matches the library table and
 * never steps a learner into a draft.
 */
export async function findStoryNeighbors(
  cursor: StoryCursor,
  view: PublicationView,
): Promise<StoryNeighbors> {
  const [previous, next] = await Promise.all([
    prisma.story.findFirst({
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
    prisma.story.findFirst({
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

export function countStories() {
  return prisma.story.count();
}

/** A crawler is a signed-out reader, so the sitemap lists published rows only. */
export function findStorySitemapRows() {
  return prisma.story.findMany({
    where: publicationWhere({ canViewUnpublished: false }),
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: { slug: true, updatedAt: true },
  });
}

// Generate the public address only on create; edits must not break shared URLs.
export async function createStory(data: StoryWriteData) {
  const slug = await resolveSlug(
    data.title,
    async (candidate) =>
      (await prisma.story.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })) !== null,
  );

  return prisma.story.create({
    data: {
      title: data.title,
      slug,
      text: data.text,
      categoryId: data.categoryId,
      sequence: data.sequence,
      isPublished: data.isPublished,
    },
    select: STORY_SELECT,
  });
}

export function updateStory(id: string, data: StoryWriteData) {
  return prisma.story.update({
    where: { id },
    data,
    select: STORY_SELECT,
  });
}

export function deleteStory(id: string) {
  return prisma.story.delete({ where: { id } });
}