import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { ConversationPracticeNav } from "@/components/features/conversation/ConversationPracticeNav";
import { ConversationPracticeWorkspace } from "@/features/conversation/ConversationPracticeWorkspace";
import { getConversationWithNavigation } from "@/server/services/conversation.service";

interface ConversationPracticePageProps {
  params: Promise<{ id: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export default async function ConversationPracticePage({
  params,
}: ConversationPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { id } = await params;
  const navigation = await getConversationWithNavigation(id);

  if (!navigation) {
    notFound();
  }

  const { conversation, previousId, nextId } = navigation;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3">
        <Link
          href="/conversations"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Conversations
        </Link>
        <ConversationPracticeNav previousId={previousId} nextId={nextId} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
          {conversation.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{conversation.description}</p>
      </header>

      <ConversationPracticeWorkspace
        title={conversation.title}
        speaker1={conversation.speaker1}
        speaker2={conversation.speaker2}
        lines={conversation.lines}
      />
    </div>
  );
}
