import type { Metadata } from "next";
import { Suspense } from "react";
import {
  StoryContent,
  StoryLoading,
} from "@/components/features/story/StoryContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Story",
  description:
    "English stories to read aloud and shadow. Hear each story in a British or American accent and follow its IPA transcription sentence by sentence.",
  path: "/story",
});

export default function StoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StoryLoading />}>
        <StoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}