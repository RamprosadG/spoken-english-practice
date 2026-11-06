import type { HomeCategoryKind } from "@/lib/categories";

export interface HomeSummary {
  users: number;
  vocabularies: number;
  sentences: number;
  conversations: number;
  presentations: number;
  listenings: number;
  /**
   * Only the five kinds Home links to. The interview kinds belong to a private
   * library, so neither is counted here.
   */
  categories: Record<HomeCategoryKind, number>;
}
