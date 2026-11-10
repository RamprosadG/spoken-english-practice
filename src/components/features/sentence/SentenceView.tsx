import { SentenceActions } from "@/components/features/sentence/SentenceActions";
import { SentenceSection } from "@/components/features/sentence/SentenceSection";
import type { SentenceListData } from "@/types/sentence";
import { SentenceHeader } from "./SentenceHeader";

interface SentenceViewProps {
  data: SentenceListData;
  isLoading?: boolean;
}

export function SentenceView({ data, isLoading = false }: SentenceViewProps) {
  return (
    <>
      <SentenceHeader
        actions={
          <SentenceActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
          />
        }
      />
      <SentenceSection
        sentences={data.sentences}
        pagination={data.pagination}
        filters={data.filters}
        categories={data.categories}
        isLoading={isLoading}
      />
    </>
  );
}
