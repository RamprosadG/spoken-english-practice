import { StoryActions } from "@/components/features/story/StoryActions";
import { StorySection } from "@/components/features/story/StorySection";
import type { StoryListData } from "@/types/story";
import { StoryHeader } from "./StoryHeader";

interface StoryViewProps {
  data: StoryListData;
  isLoading?: boolean;
}

export function StoryView({ data, isLoading = false }: StoryViewProps) {
  return (
    <>
      <StoryHeader
        actions={
          <StoryActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
          />
        }
      />
      <StorySection
        stories={data.stories}
        pagination={data.pagination}
        filters={data.filters}
        categories={data.categories}
        isLoading={isLoading}
      />
    </>
  );
}