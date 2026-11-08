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
  "vocabulary",
  "interview",
  "topic",
] as const;

export type CategoryKind = (typeof CATEGORY_KINDS)[number];

/** The kinds Home counts. Interview categories and topics are a private library. */
export const HOME_CATEGORY_KINDS = [
  "presentation",
  "sentence",
  "conversation",
  "listening",
  "vocabulary",
] as const;

export type HomeCategoryKind = (typeof HOME_CATEGORY_KINDS)[number];

const PRIVATE_CATEGORY_KINDS: CategoryKind[] = ["interview", "topic"];

/**
 * Interview categories and topics only ever name rows of a library a public
 * reader cannot reach, so their option lists are admin-only as well.
 */
export function isPrivateCategoryKind(kind: CategoryKind): boolean {
  return PRIVATE_CATEGORY_KINDS.includes(kind);
}

export const CATEGORY_ENTITY_LABELS: Record<CategoryKind, string> = {
  presentation: "presentation",
  sentence: "sentence",
  conversation: "conversation",
  listening: "listening",
  vocabulary: "vocabulary word",
  interview: "interview question",
  topic: "interview question",
};

export interface CategoryNouns {
  singular: string;
  plural: string;
}

/** Every kind but one groups with categories; the interview picker manages topics. */
export const CATEGORY_NOUNS: Record<CategoryKind, CategoryNouns> = {
  presentation: { singular: "category", plural: "categories" },
  sentence: { singular: "category", plural: "categories" },
  conversation: { singular: "category", plural: "categories" },
  listening: { singular: "category", plural: "categories" },
  vocabulary: { singular: "category", plural: "categories" },
  interview: { singular: "category", plural: "categories" },
  topic: { singular: "topic", plural: "topics" },
};

export const CATEGORY_MANAGE_TITLES: Record<CategoryKind, string> = {
  presentation: "Presentation Categories",
  sentence: "Sentence Categories",
  conversation: "Conversation Categories",
  listening: "Listening Categories",
  vocabulary: "Vocabulary Categories",
  interview: "Interview Categories",
  topic: "Interview Topics",
};

/**
 * Written out per kind because the article changes ("A presentation category",
 * "An interview topic"), and a generated sentence cannot know that.
 */
export const CATEGORY_DUPLICATE_MESSAGES: Record<CategoryKind, string> = {
  presentation: "A presentation category with this name already exists.",
  sentence: "A sentence category with this name already exists.",
  conversation: "A conversation category with this name already exists.",
  listening: "A listening category with this name already exists.",
  vocabulary: "A vocabulary category with this name already exists.",
  interview: "An interview category with this name already exists.",
  topic: "An interview topic with this name already exists.",
};

export const ALL_CATEGORIES_LABEL = "All Categories";
export const ALL_TOPICS_LABEL = "All Topics";

export interface CategoryOptionSource {
  id: string;
  name: string;
}

export function buildCategoryFilterOptions(
  categories: CategoryOptionSource[],
  allLabel: string = ALL_CATEGORIES_LABEL,
): { value: string; label: string }[] {
  return [
    { value: "", label: allLabel },
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

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** The action-row label a picker opens with: **Categories**, or **Topics**. */
export function categoryButtonLabel(kind: CategoryKind): string {
  return capitalize(CATEGORY_NOUNS[kind].plural);
}
