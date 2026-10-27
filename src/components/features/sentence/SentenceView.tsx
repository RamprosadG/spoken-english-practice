import { SentenceActions } from "@/features/sentence/SentenceActions";
import { SentenceSection } from "@/features/sentence/SentenceSection";
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
        actions={<SentenceActions nextSequence={data.nextSequence} />}
      />
      <SentenceSection
        sentences={data.sentences}
        pagination={data.pagination}
        filters={data.filters}
        isLoading={isLoading}
      />
    </>
  );
}
