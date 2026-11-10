import { PresentationActions } from "@/components/features/presentation/PresentationActions";
import { PresentationSection } from "@/components/features/presentation/PresentationSection";
import type { PresentationListData } from "@/types/presentation";
import { PresentationHeader } from "./PresentationHeader";

interface PresentationViewProps {
  data: PresentationListData;
  isLoading?: boolean;
}

export function PresentationView({
  data,
  isLoading = false,
}: PresentationViewProps) {
  return (
    <>
      <PresentationHeader
        actions={
          <PresentationActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
          />
        }
      />
      <PresentationSection
        presentations={data.presentations}
        pagination={data.pagination}
        filters={data.filters}
        categories={data.categories}
        isLoading={isLoading}
      />
    </>
  );
}
