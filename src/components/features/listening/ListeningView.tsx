import { ListeningActions } from "@/components/features/listening/ListeningActions";
import { ListeningSection } from "@/components/features/listening/ListeningSection";
import type { ListeningListData } from "@/types/listening";
import { ListeningHeader } from "./ListeningHeader";

interface ListeningViewProps {
  data: ListeningListData;
  isLoading?: boolean;
}

export function ListeningView({ data, isLoading = false }: ListeningViewProps) {
  return (
    <>
      <ListeningHeader
        actions={
          <ListeningActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
          />
        }
      />
      <ListeningSection
        listenings={data.listenings}
        pagination={data.pagination}
        filters={data.filters}
        categories={data.categories}
        isLoading={isLoading}
      />
    </>
  );
}
