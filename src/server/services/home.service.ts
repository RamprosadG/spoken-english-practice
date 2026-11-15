import { connection } from "next/server";
import { canViewUnpublishedContent } from "@/server/services/auth.service";
import { countCategories } from "@/server/repositories/category.repository";
import { countConversations } from "@/server/repositories/conversation.repository";
import { countQuestions } from "@/server/repositories/question.repository";
import { countListenings } from "@/server/repositories/listening.repository";
import { countPresentations } from "@/server/repositories/presentation.repository";
import { countSentences } from "@/server/repositories/sentence.repository";
import { countStories } from "@/server/repositories/story.repository";
import { countUsers } from "@/server/repositories/user.repository";
import { countVocabulary } from "@/server/repositories/vocabulary.repository";
import type { HomeSummary } from "@/types/home";

/**
 * Every total is an unfiltered COUNT in PostgreSQL — the rows are never loaded
 * into the server just to be counted. The two question counts are the only
 * conditional pair: a private library is not read for a reader it is closed to.
 */
export async function getHomeSummary(): Promise<HomeSummary> {
  await connection();

  const isAdmin = await canViewUnpublishedContent();

  const [
    users,
    vocabularies,
    sentences,
    conversations,
    presentations,
    stories,
    listenings,
    presentationCategories,
    sentenceCategories,
    conversationCategories,
    listeningCategories,
    vocabularyCategories,
    storyCategories,
    questions,
    questionCategories,
  ] = await Promise.all([
    countUsers(),
    countVocabulary(),
    countSentences(),
    countConversations(),
    countPresentations(),
    countStories(),
    countListenings(),
    countCategories("presentation"),
    countCategories("sentence"),
    countCategories("conversation"),
    countCategories("listening"),
    countCategories("vocabulary"),
    countCategories("story"),
    isAdmin ? countQuestions() : Promise.resolve(0),
    isAdmin ? countCategories("question") : Promise.resolve(0),
  ]);

  return {
    users,
    vocabularies,
    sentences,
    conversations,
    presentations,
    stories,
    listenings,
    categories: {
      presentation: presentationCategories,
      sentence: sentenceCategories,
      conversation: conversationCategories,
      listening: listeningCategories,
      vocabulary: vocabularyCategories,
      story: storyCategories,
    },
    question: isAdmin
      ? { questions, categories: questionCategories }
      : null,
  };
}
