import { connection } from "next/server";
import { countPresentations } from "@/server/repositories/presentation.repository";
import { countSentences } from "@/server/repositories/sentence.repository";
import { countUsers } from "@/server/repositories/user.repository";
import { countVocabulary } from "@/server/repositories/vocabulary.repository";
import type { HomeSummary } from "@/types/home";

/**
 * Every total is an unfiltered COUNT in PostgreSQL — the rows are never loaded
 * into the server just to be counted.
 */
export async function getHomeSummary(): Promise<HomeSummary> {
  await connection();

  const [users, presentations, sentences, vocabularies] = await Promise.all([
    countUsers(),
    countPresentations(),
    countSentences(),
    countVocabulary(),
  ]);

  return { users, presentations, sentences, vocabularies };
}
