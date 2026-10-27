import { z } from "zod";

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} cannot exceed ${max.toLocaleString("en-US")} characters.`);

const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} cannot exceed ${max.toLocaleString("en-US")} characters.`)
    .nullish()
    .transform((value) => {
      const trimmed = value?.trim() ?? "";
      return trimmed.length > 0 ? trimmed : null;
    });

export const vocabularyInputSchema = z.object({
  text: requiredText("Word", 100),
  meaning: requiredText("Bengali meaning", 500),
  sentence: requiredText("Example sentence", 1000),
  sentenceMeaning: requiredText("Example sentence meaning", 1000),
  synonymText: optionalText("Synonym", 100),
  synonymMeaning: optionalText("Synonym meaning", 500),
  synonymSentence: optionalText("Synonym sentence", 1000),
  synonymSentenceMeaning: optionalText("Synonym sentence meaning", 1000),
  antonymText: optionalText("Antonym", 100),
  antonymMeaning: optionalText("Antonym meaning", 500),
  antonymSentence: optionalText("Antonym sentence", 1000),
  antonymSentenceMeaning: optionalText("Antonym sentence meaning", 1000),
  sequence: z.coerce
    .number()
    .int("Sequence must be a whole number.")
    .min(1, "Sequence must be at least 1.")
    .max(100000, "Sequence cannot exceed 100,000."),
}).superRefine((data, ctx) => {
  if (
    !data.synonymText &&
    (data.synonymMeaning ||
      data.synonymSentence ||
      data.synonymSentenceMeaning)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["synonymText"],
      message: "Enter the synonym word to use its details.",
    });
  }

  if (
    !data.antonymText &&
    (data.antonymMeaning ||
      data.antonymSentence ||
      data.antonymSentenceMeaning)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["antonymText"],
      message: "Enter the antonym word to use its details.",
    });
  }
});

export type VocabularyInput = z.infer<typeof vocabularyInputSchema>;
