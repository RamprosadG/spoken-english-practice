import { z } from "zod";
import { CATEGORY_KINDS } from "@/lib/categories";

export const categoryKindSchema = z.enum(CATEGORY_KINDS);

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(100, "Category name cannot exceed 100 characters."),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000.")
    .optional(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
