import { connection } from "next/server";
import { findConversationSitemapRows } from "@/server/repositories/conversation.repository";
import { findListeningSitemapRows } from "@/server/repositories/listening.repository";
import { findPresentationSitemapRows } from "@/server/repositories/presentation.repository";
import { findSentenceSitemapRows } from "@/server/repositories/sentence.repository";
import { findStorySitemapRows } from "@/server/repositories/story.repository";
import { findVideoSitemapRows } from "@/server/repositories/video.repository";
import { findVocabularySitemapRows } from "@/server/repositories/vocabulary.repository";
import type { SitemapLibrary } from "@/server/types/sitemap";

/**
 * Only the seven public libraries are listed. The question library is private to
 * an admin and the learner page is an account list, so neither is a crawler's
 * business and neither is read here.
 */
export async function getSitemapLibraries(): Promise<SitemapLibrary[]> {
  // Rows are added and published by hand, so a build-time snapshot would go stale.
  await connection();

  const [vocabulary, sentence, conversation, presentation, story, video, listening] =
    await Promise.all([
      findVocabularySitemapRows(),
      findSentenceSitemapRows(),
      findConversationSitemapRows(),
      findPresentationSitemapRows(),
      findStorySitemapRows(),
      findVideoSitemapRows(),
      findListeningSitemapRows(),
    ]);

  return [
    { path: "/vocabulary", rows: vocabulary },
    { path: "/sentence", rows: sentence },
    { path: "/conversation", rows: conversation },
    { path: "/presentation", rows: presentation },
    { path: "/story", rows: story },
    { path: "/video", rows: video },
    { path: "/listening", rows: listening },
  ];
}