import type { Metadata } from "next";
import { Suspense } from "react";
import {
  VocabularyContent,
  VocabularyLoading,
} from "@/components/features/vocabulary/VocabularyContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Vocabulary",
  description:
    "Important English words with Bengali meanings, IPA pronunciation, example sentences, synonyms and antonyms. Listen to every word and say it out loud.",
  path: "/vocabulary",
});

export default function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<VocabularyLoading />}>
        <VocabularyContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
