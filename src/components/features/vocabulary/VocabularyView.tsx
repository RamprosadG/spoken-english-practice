import { VocabularyActions } from "@/features/vocabulary/VocabularyActions";
import { VocabularySection } from "@/features/vocabulary/VocabularySection";
import type { VocabularyListData } from "@/types/vocabulary";
import { VocabularyHeader } from "./VocabularyHeader";

interface VocabularyViewProps {
  data: VocabularyListData;
  isLoading?: boolean;
}

export function VocabularyView({ data, isLoading = false }: VocabularyViewProps) {
  return (
    <>
      <VocabularyHeader
        actions={
          <VocabularyActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
          />
        }
      />
      <VocabularySection
        vocabularies={data.vocabularies}
        pagination={data.pagination}
        filters={data.filters}
        categories={data.categories}
        isLoading={isLoading}
      />
    </>
  );
}
