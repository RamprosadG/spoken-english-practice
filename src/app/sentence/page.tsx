import { Suspense } from "react";
import {
  SentenceContent,
  SentenceLoading,
} from "@/components/features/sentence/SentenceContent";

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
