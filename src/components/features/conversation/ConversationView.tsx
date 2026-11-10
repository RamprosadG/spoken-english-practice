import { ConversationActions } from "@/components/features/conversation/ConversationActions";
import { ConversationSection } from "@/components/features/conversation/ConversationSection";
import type { ConversationListData } from "@/types/conversation";
import { ConversationHeader } from "./ConversationHeader";

interface ConversationViewProps {
  data: ConversationListData;
  isLoading?: boolean;
}

export function ConversationView({
  data,
  isLoading = false,
}: ConversationViewProps) {
  return (
    <>
      <ConversationHeader
        actions={
          <ConversationActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
          />
        }
      />
      <ConversationSection
        conversations={data.conversations}
        pagination={data.pagination}
        filters={data.filters}
        categories={data.categories}
        isLoading={isLoading}
      />
    </>
  );
}
