import { ConversationActions } from "@/features/conversation/ConversationActions";
import { ConversationSection } from "@/features/conversation/ConversationSection";
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
        actions={<ConversationActions nextSequence={data.nextSequence} />}
      />
      <ConversationSection
        conversations={data.conversations}
        pagination={data.pagination}
        filters={data.filters}
        isLoading={isLoading}
      />
    </>
  );
}
