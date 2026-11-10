import { z } from "zod";
import { QUESTION_DIFFICULTIES } from "@/types/question";
import { isPublishedInputSchema } from "@/lib/validations/publishing";

export const questionInputSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required.")
    .max(500, "Question cannot exceed 500 characters."),
  answer: z
    .string()
    .trim()
    .min(1, "Answer is required.")
    .max(8000, "Answer cannot exceed 8,000 characters."),
  categoryId: z.string().trim().min(1, "Category is required."),
  topicId: z.string().trim().min(1, "Topic is required."),
  difficulty: z.enum(QUESTION_DIFFICULTIES).default("beginner"),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
  isPublished: isPublishedInputSchema,
});

export type QuestionInput = z.infer<
  typeof questionInputSchema
>;
