import { z } from "zod";
import { isPublishedInputSchema } from "@/lib/validations/publishing";

export const LISTENING_ITEM_MAX_LENGTH = 1000;
export const LISTENING_MAX_ITEMS = 60;

const itemText = z
  .string()
  .trim()
  .min(1, "Each listening sentence is required.")
  .max(
    LISTENING_ITEM_MAX_LENGTH,
    `A listening sentence cannot exceed ${LISTENING_ITEM_MAX_LENGTH.toLocaleString("en-US")} characters.`,
  );

export const listeningInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title cannot exceed 200 characters."),
  categoryId: z.string().trim().min(1, "Category is required."),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
  isPublished: isPublishedInputSchema,
  // The array order is the practice order, so ids never travel to the server.
  items: z
    .array(itemText)
    .min(1, "A listening needs at least one sentence.")
    .max(
      LISTENING_MAX_ITEMS,
      `A listening cannot exceed ${LISTENING_MAX_ITEMS} sentences.`,
    ),
});

export type ListeningInput = z.infer<typeof listeningInputSchema>;
