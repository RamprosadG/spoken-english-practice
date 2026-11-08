import type { ReactNode } from "react";

interface ConversationHeaderProps {
  actions: ReactNode;
}

export function ConversationHeader({ actions }: ConversationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Regular Conversation
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Collect the everyday two-person dialogues you want to sound natural
          in. Each turn is saved in order, so you can rehearse both sides of the
          conversation with a different voice for every speaker.
        </p>
      </div>
      {/* Unwrapping lets two `w-full` buttons shrink to halves below sm. */}
      <div className="flex items-center gap-3 shrink-0 max-sm:w-full">
        {actions}
      </div>
    </div>
  );
}
