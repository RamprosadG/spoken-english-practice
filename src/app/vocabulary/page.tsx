import { Suspense } from "react";
import {
  VocabularyContent,
  VocabularyLoading,
} from "@/components/features/vocabulary/VocabularyContent";

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
