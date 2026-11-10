import type { HomeCategoryKind } from "@/lib/categories";

export interface HomeSummary {
  users: number;
  vocabularies: number;
  sentences: number;
  conversations: number;
  presentations: number;
  listenings: number;
  /**
   * Only the five kinds Home links to. The question kinds belong to a private
   * library, so they are counted in `question` instead of widening this record.
   */
  categories: Record<HomeCategoryKind, number>;
  /**
   * Totals of the admin-only question library. `null` for every other reader:
   * a private library is not counted at all, not even as a number.
   */
  question: { questions: number; categories: number } | null;
}
