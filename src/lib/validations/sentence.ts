import { z } from "zod";
import { isPublishedInputSchema } from "@/lib/validations/publishing";

export const SENTENCE_WHEN_TO_USE_MAX_LENGTH = 500;
export const SENTENCE_ALTERNATE_MAX_LENGTH = 1000;
export const SENTENCE_MAX_ALTERNATES = 20;

const alternateText = z
  .string()
  .trim()
  .min(1, "Each alternate expression is required.")
  .max(
    SENTENCE_ALTERNATE_MAX_LENGTH,
    `An alternate expression cannot exceed ${SENTENCE_ALTERNATE_MAX_LENGTH.toLocaleString("en-US")} characters.`,
  );

export const sentenceInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Sentence text is required.")
    .max(1000, "Sentence text cannot exceed 1,000 characters."),
  categoryId: z.string().trim().min(1, "Category is required."),
  meaning: z
    .string()
    .trim()
    .min(1, "Meaning is required.")
    .max(1000, "Meaning cannot exceed 1,000 characters."),
  whenToUse: z
    .string()
    .trim()
    .max(
      SENTENCE_WHEN_TO_USE_MAX_LENGTH,
      `When to use cannot exceed ${SENTENCE_WHEN_TO_USE_MAX_LENGTH.toLocaleString("en-US")} characters.`,
    )
    .nullish()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
  isPublished: isPublishedInputSchema,
  // The array order is the stored alternate sequence, so ids never travel here.
  alternates: z
    .array(alternateText)
    .max(
      SENTENCE_MAX_ALTERNATES,
      `A sentence cannot carry more than ${SENTENCE_MAX_ALTERNATES} alternate expressions.`,
    )
    .default([]),
});

export type SentenceInput = z.infer<typeof sentenceInputSchema>;
