import { connection } from "next/server";
import { ApiError } from "@/lib/api-error";
import type { PresentationInput } from "@/lib/validations/presentation";
import {
  createPresentation as createPresentationRecord,
  deletePresentation as deletePresentationRecord,
  findNextPresentationSequence,
  findPresentationById,
  findPresentationPage,
  updatePresentation as updatePresentationRecord,
} from "@/server/repositories/presentation.repository";
import { requireAdminUser } from "@/server/services/auth.service";
import type {
  PresentationFilterParams,
  PresentationPageResult,
} from "@/server/types/presentation";
import type { PresentationItem } from "@/types/presentation";

export const PRESENTATION_PAGE_SIZE = 20;

interface PresentationRecord {
  id: string;
  title: string;
  text: string;
  sequence: number;
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
    createdAt: presentation.createdAt.toISOString(),
    updatedAt: presentation.updatedAt.toISOString(),
  };
}

export async function listPresentations(
  query: PresentationFilterParams,
): Promise<PresentationPageResult> {
  // The library changes with every saved record, so never prerender this.
  await connection();

  const [list, nextSequence] = await Promise.all([
    findPresentationPage({
      ...query,
      search: query.search?.trim() || undefined,
    }),
    findNextPresentationSequence(),
  ]);

  return { ...list, nextSequence };
}

export async function getPresentationById(
  id: string,
): Promise<PresentationItem | null> {
  const presentation = await findPresentationById(id);
  return presentation ? toPresentationItem(presentation) : null;
}

export async function createPresentation(
  input: PresentationInput,
): Promise<PresentationItem> {
  await requireAdminUser();

  const presentation = await createPresentationRecord(input);
  return toPresentationItem(presentation);
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

  const presentation = await updatePresentationRecord(id, input);
  return toPresentationItem(presentation);
}

export async function deletePresentation(id: string): Promise<void> {
  await requireAdminUser();

  const existing = await findPresentationById(id);
  if (!existing) {
    throw new ApiError(404, "Presentation is not found.");
  }

  await deletePresentationRecord(id);
}
