import { PresentationActions } from "@/features/presentation/PresentationActions";
import { PresentationSection } from "@/features/presentation/PresentationSection";
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
        actions={<PresentationActions nextSequence={data.nextSequence} />}
      />
      <PresentationSection
        presentations={data.presentations}
        pagination={data.pagination}
        filters={data.filters}
        isLoading={isLoading}
      />
    </>
  );
}
