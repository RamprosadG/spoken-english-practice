import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ListeningContent,
  ListeningLoading,
} from "@/components/features/listening/ListeningContent";

export const metadata: Metadata = {
  title: "Listening",
  description:
    "English dictation practice. Listen to each sentence, type what you hear and check your answer word by word, or read the full transcription with IPA.",
};

export default function ListeningsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<ListeningLoading />}>
        <ListeningContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
