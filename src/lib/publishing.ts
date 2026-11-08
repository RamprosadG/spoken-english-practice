/**
 * Shared publishing vocabulary. Kept free of server and Zod imports so the
 * client islands can reuse the same option lists as the database filter.
 */
export type PublicationStatusFilter = "published" | "draft";

export interface PublicationView {
  status?: PublicationStatusFilter;
  /** Omitting this is the same as false, so a caller cannot forget the gate. */
  canViewUnpublished?: boolean;
}

export const PUBLICATION_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export const PUBLICATION_FORM_OPTIONS: { value: string; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export function parsePublicationStatus(
  value: string | undefined,
): PublicationStatusFilter | undefined {
  return value === "published" || value === "draft" ? value : undefined;
}

export function publicationStatusValue(isPublished: boolean): string {
  return isPublished ? "published" : "draft";
}

export function isPublishedFromStatus(status: string): boolean {
  return status !== "draft";
}

/**
 * Everyone who is not an admin is pinned to published rows; the status filter
 * only ever applies to an admin, so a crafted query parameter cannot reveal a
 * draft.
 */
export function publicationWhere(
  view: PublicationView,
): { isPublished: boolean } | Record<string, never> {
  if (!view.canViewUnpublished) {
    return { isPublished: true };
  }

  if (!view.status) {
    return {};
  }

  return { isPublished: view.status === "published" };
}
