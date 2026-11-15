import { z } from "zod";
import { isPublishedInputSchema } from "@/lib/validations/publishing";
import { parseYouTubeVideoId } from "@/lib/youtube";

export const videoInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title cannot exceed 200 characters."),
  link: z
    .string()
    .trim()
    .min(1, "YouTube link is required.")
    .refine((val) => parseYouTubeVideoId(val) !== null, {
      message:
        "Please enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)",
    }),
  categoryId: z.string().trim().min(1, "Category is required."),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
  isPublished: isPublishedInputSchema,
});

export type VideoInput = z.infer<typeof videoInputSchema>;
