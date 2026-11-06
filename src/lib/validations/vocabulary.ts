import { z } from "zod";
import { PARTS_OF_SPEECH } from "@/types/vocabulary";
import { isPublishedInputSchema } from "@/lib/validations/publishing";

export const VOCABULARY_WORD_MAX_LENGTH = 100;
export const VOCABULARY_RELATED_SENTENCE_MAX_LENGTH = 1000;
export const VOCABULARY_MAX_RELATED_WORDS = 20;

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} cannot exceed ${max.toLocaleString("en-US")} characters.`);

/**
 * One synonym or antonym row: the word and the sentence that shows it. The
 * Bengali meanings stay on the vocabulary word itself, so nothing is translated
 * here.
 */
const relatedWordSchema = (label: string) =>
  z.object({
    word: requiredText(`${label} word`, VOCABULARY_WORD_MAX_LENGTH),
    sentence: requiredText(
      `${label} sentence`,
      VOCABULARY_RELATED_SENTENCE_MAX_LENGTH,
    ),
  });

const relatedWordListSchema = (label: string, plural: string) =>
  z
    .array(relatedWordSchema(label))
    .max(
      VOCABULARY_MAX_RELATED_WORDS,
      `A word cannot carry more than ${VOCABULARY_MAX_RELATED_WORDS} ${plural}.`,
    )
    // The array order is the stored sequence, so ids never travel here.
    .default([]);

export const vocabularyInputSchema = z.object({
  text: requiredText("Word", VOCABULARY_WORD_MAX_LENGTH),
  meaning: requiredText("Bengali meaning", 500),
  sentence: requiredText("Example sentence", 1000),
  sentenceMeaning: requiredText("Example sentence meaning", 1000),
  categoryId: z.string().trim().min(1, "Category is required."),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
  isPublished: isPublishedInputSchema,
  partsOfSpeech: z.enum(PARTS_OF_SPEECH).default("noun"),
  synonyms: relatedWordListSchema("Synonym", "synonyms"),
  antonyms: relatedWordListSchema("Antonym", "antonyms"),
});

export type VocabularyInput = z.infer<typeof vocabularyInputSchema>;
