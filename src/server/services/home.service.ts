import { connection } from "next/server";
import { countCategories } from "@/server/repositories/category.repository";
import { countConversations } from "@/server/repositories/conversation.repository";
import { countListenings } from "@/server/repositories/listening.repository";
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

  const [
    users,
    vocabularies,
    sentences,
    conversations,
    presentations,
    listenings,
    presentationCategories,
    sentenceCategories,
    conversationCategories,
    listeningCategories,
  ] = await Promise.all([
    countUsers(),
    countVocabulary(),
    countSentences(),
    countConversations(),
    countPresentations(),
    countListenings(),
    countCategories("presentation"),
    countCategories("sentence"),
    countCategories("conversation"),
    countCategories("listening"),
  ]);

  return {
    users,
    vocabularies,
    sentences,
    conversations,
    presentations,
    listenings,
    categories: {
      presentation: presentationCategories,
      sentence: sentenceCategories,
      conversation: conversationCategories,
      listening: listeningCategories,
    },
  };
}
