import { z } from "zod";

/**
 * A payload that omits the field publishes the row, matching the column
 * default, so no save can quietly create content that no learner can see.
 */
export const isPublishedInputSchema = z.boolean().default(true);
