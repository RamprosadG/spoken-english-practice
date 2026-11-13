import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ConversationContent,
  ConversationLoading,
} from "@/components/features/conversation/ConversationContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Conversation",
  description:
    "Everyday English conversations between two speakers. Hear both voices, follow the IPA for every turn and practise the dialogue out loud.",
  path: "/conversation",
});

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
