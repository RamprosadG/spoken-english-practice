import type { CategoryKind } from "@/lib/categories";

export interface HomeSummary {
  users: number;
  vocabularies: number;
  sentences: number;
  conversations: number;
  presentations: number;
  listenings: number;
  /** Vocabulary is deliberately uncategorised, so it has no entry here. */
  categories: Record<CategoryKind, number>;
}
