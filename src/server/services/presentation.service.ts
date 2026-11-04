import { connection } from "next/server";
import { ApiError, uniqueViolationError } from "@/lib/api-error";
import type { PresentationInput } from "@/lib/validations/presentation";
import {
  createPresentation as createPresentationRecord,
  deletePresentation as deletePresentationRecord,
  findNextPresentationSequence,
  findPresentationById,
  findPresentationNeighbors,
  findPresentationPage,
  updatePresentation as updatePresentationRecord,
} from "@/server/repositories/presentation.repository";
import { requireAdminUser, canViewUnpublishedContent } from "@/server/services/auth.service";
import type {
  PresentationFilterParams,
  PresentationPageResult,
} from "@/server/types/presentation";
import type {
  PresentationItem,
  PresentationNavigation,
} from "@/types/presentation";

export const PRESENTATION_PAGE_SIZE = 20;

interface PresentationRecord {
  id: string;
  title: string;
  text: string;
  sequence: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toPresentationItem(
  presentation: PresentationRecord,
): PresentationItem {
  return {
    id: presentation.id,
    title: presentation.title,
    text: presentation.text,
    sequence: presentation.sequence,
    isPublished: presentation.isPublished,
    createdAt: presentation.createdAt.toISOString(),
    updatedAt: presentation.updatedAt.toISOString(),
  };
}

export async function listPresentations(
  query: PresentationFilterParams,
): Promise<PresentationPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  // Drafts are an admin-only view, and the gate runs inside the SQL query.
  const canViewUnpublished = await canViewUnpublishedContent();

  const [list, nextSequence] = await Promise.all([
    findPresentationPage({
      ...query,
      canViewUnpublished,
      search: query.search?.trim() || undefined,
    }),
    findNextPresentationSequence(),
  ]);

  return { ...list, nextSequence };
}

export async function getPresentationWithNavigation(
  id: string,
): Promise<PresentationNavigation | null> {
  // Neighbours move with every saved row, so never prerender this.
  await connection();

  const canViewUnpublished = await canViewUnpublishedContent();

  const presentation = await findPresentationById(id);
  if (!presentation) {
    return null;
  }

  if (!canViewUnpublished && !presentation.isPublished) {
    return null;
  }

  const neighbors = await findPresentationNeighbors(
    {
      sequence: presentation.sequence,
      createdAt: presentation.createdAt,
    },
    { canViewUnpublished },
  );

  return {
    presentation: toPresentationItem(presentation),
    previousId: neighbors.previousId,
    nextId: neighbors.nextId,
  };
}

export async function createPresentation(
  input: PresentationInput,
): Promise<PresentationItem> {
  await requireAdminUser();

  try {
    const presentation = await createPresentationRecord(input);
    return toPresentationItem(presentation);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A presentation with this title already exists.",
    );
  }
}

export async function updatePresentation(
  id: string,
  input: PresentationInput,
): Promise<PresentationItem> {
  await requireAdminUser();

  const existing = await findPresentationById(id);
  if (!existing) {
    throw new ApiError(404, "Presentation is not found.");
  }

  try {
    const presentation = await updatePresentationRecord(id, input);
    return toPresentationItem(presentation);
  } catch (error) {
    throw uniqueViolationError(
      error,
      "A presentation with this title already exists.",
    );
  }
}

export async function deletePresentation(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findPresentationById(id);
  if (!existing) {
    throw new ApiError(404, "Presentation is not found.");
  }

  await deletePresentationRecord(id);
}
