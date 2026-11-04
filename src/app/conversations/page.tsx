import { Suspense } from "react";
import {
  ConversationContent,
  ConversationLoading,
} from "@/components/features/conversation/ConversationContent";

export default function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<ConversationLoading />}>
        <ConversationContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
