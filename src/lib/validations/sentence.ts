import { z } from "zod";

export const sentenceInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Sentence text is required.")
    .max(1000, "Sentence text cannot exceed 1,000 characters."),
  meaning: z
    .string()
    .trim()
    .min(1, "Meaning is required.")
    .max(1000, "Meaning cannot exceed 1,000 characters."),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
});

export type SentenceInput = z.infer<typeof sentenceInputSchema>;
