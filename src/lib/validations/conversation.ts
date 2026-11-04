import { z } from "zod";
import { isPublishedInputSchema } from "@/lib/validations/publishing";

export const CONVERSATION_LINE_MAX_LENGTH = 1000;
export const CONVERSATION_MAX_LINES = 60;

const lineText = z
  .string()
  .trim()
  .min(1, "Each conversation line is required.")
  .max(
    CONVERSATION_LINE_MAX_LENGTH,
    `A conversation line cannot exceed ${CONVERSATION_LINE_MAX_LENGTH.toLocaleString("en-US")} characters.`,
  );

export const conversationInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title cannot exceed 200 characters."),
  speaker1: z
    .string()
    .trim()
    .min(1, "Speaker 1 name is required.")
    .max(60, "Speaker names cannot exceed 60 characters."),
  speaker2: z
    .string()
    .trim()
    .min(1, "Speaker 2 name is required.")
    .max(60, "Speaker names cannot exceed 60 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(500, "Description cannot exceed 500 characters."),
  categoryId: z.string().trim().min(1, "Category is required."),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
  isPublished: isPublishedInputSchema,
  // The array order is the turn order, so ids never travel to the server.
  lines: z
    .array(lineText)
    .min(2, "A conversation needs at least two lines.")
    .max(CONVERSATION_MAX_LINES, `A conversation cannot exceed ${CONVERSATION_MAX_LINES} lines.`),
});

export type ConversationInput = z.infer<typeof conversationInputSchema>;
