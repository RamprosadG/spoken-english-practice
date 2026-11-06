import type { HomeCategoryKind } from "@/lib/categories";

export interface HomeSummary {
  users: number;
  vocabularies: number;
  sentences: number;
  conversations: number;
  presentations: number;
  listenings: number;
  /**
   * Only the four kinds Home links to. Vocabulary is deliberately uncategorised,
   * and the interview kinds belong to a private library, so neither is counted
   * here.
   */
  categories: Record<HomeCategoryKind, number>;
}
