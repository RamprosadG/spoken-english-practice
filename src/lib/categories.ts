/**
 * Shared category vocabulary. Kept free of server and Zod imports so the client
 * islands can reuse the same kind list, labels and option builders as the
 * database filter.
 */
export const CATEGORY_KINDS = [
  "presentation",
  "sentence",
  "conversation",
  "listening",
] as const;

export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export const CATEGORY_ENTITY_LABELS: Record<CategoryKind, string> = {
  presentation: "presentation",
  sentence: "sentence",
  conversation: "conversation",
  listening: "listening",
};

export const CATEGORY_MANAGE_TITLES: Record<CategoryKind, string> = {
  presentation: "Presentation categories",
  sentence: "Sentence categories",
  conversation: "Conversation categories",
  listening: "Listening categories",
};

export const ALL_CATEGORIES_LABEL = "All categories";

export interface CategoryOptionSource {
  id: string;
  name: string;
}

export function buildCategoryFilterOptions(
  categories: CategoryOptionSource[],
): { value: string; label: string }[] {
  return [
    { value: "", label: ALL_CATEGORIES_LABEL },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];
}

export function buildCategoryFormOptions(
  categories: CategoryOptionSource[],
): { value: string; label: string }[] {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
}

export function categoryUsageLabel(
  kind: CategoryKind,
  count: number,
): string {
  const label = CATEGORY_ENTITY_LABELS[kind];
  return `${count} ${count === 1 ? label : `${label}s`}`;
}
