import { z } from "zod";

export const presentationInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title cannot exceed 200 characters."),
  text: z
    .string()
    .trim()
    .min(1, "Text is required.")
    .max(20000, "Text cannot exceed 20,000 characters."),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
});

export type PresentationInput = z.infer<typeof presentationInputSchema>;
