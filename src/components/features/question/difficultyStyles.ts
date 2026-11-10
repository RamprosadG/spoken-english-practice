import type { QuestionDifficulty } from "@/types/question";

/**
 * One palette per difficulty, so a row reads the same in the library table and
 * the practice header.
 */
export const QUESTION_DIFFICULTY_BADGE_VARIANTS: Record<
  QuestionDifficulty,
  "success" | "warning" | "danger"
> = {
  beginner: "success",
  intermediate: "warning",
  hard: "danger",
};
