import type { Metadata } from "next";
import { Suspense } from "react";
import {
  SentenceContent,
  SentenceLoading,
} from "@/components/features/sentence/SentenceContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sentence",
  description:
    "Common English sentences with Bengali meanings, IPA pronunciation and alternate expressions. Listen, repeat and learn when to use each one.",
  path: "/sentence",
});

export default function SentencesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<SentenceLoading />}>
        <SentenceContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
