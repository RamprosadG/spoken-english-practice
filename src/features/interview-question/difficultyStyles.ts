import type { InterviewQuestionDifficulty } from "@/types/interview-question";

/**
 * One palette per difficulty, so a row reads the same in the library table and
 * the practice header.
 */
export const INTERVIEW_DIFFICULTY_BADGE_VARIANTS: Record<
  InterviewQuestionDifficulty,
  "success" | "warning" | "danger"
> = {
  beginner: "success",
  intermediate: "warning",
  hard: "danger",
};
