"use client";

import { useMemo } from "react";
import Badge from "@/components/ui/badges/Badge";
import { CopyTextButton } from "@/features/practice/CopyTextButton";
import type { ConversationLineItem } from "@/types/conversation";
import { ConversationIpaCard } from "./ConversationIpaCard";
import { ConversationPracticeControls } from "./ConversationPracticeControls";
import {
  SPEAKER_BADGE_VARIANTS,
  SPEAKER_ROW_CLASSES,
} from "./speakerStyles";
import { useConversationPractice } from "./useConversationPractice";

interface ConversationPracticeWorkspaceProps {
  title: string;
  speaker1: string;
  speaker2: string;
  lines: ConversationLineItem[];
}

export function ConversationPracticeWorkspace({
  title,
  speaker1,
  speaker2,
  lines,
}: ConversationPracticeWorkspaceProps) {
  const practice = useConversationPractice({ speaker1, speaker2, lines });

  const speakerNames = { one: speaker1, two: speaker2 } as const;

  // The copy keeps the names because a pasted dialogue needs them, while the
  // spoken utterances never include them.
  const copyText = useMemo(
    () =>
      `${title}\n\n${lines
        .map((line) => {
          const name = line.speaker === "one" ? speaker1 : speaker2;
          return `${name}: ${line.text}`;
        })
        .join("\n")}`,
    [lines, speaker1, speaker2, title],
  );

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Conversation text
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Follow the turns in order, then listen with one voice per speaker
              in your chosen accent.
            </p>
          </div>

          <CopyTextButton
            text={copyText}
            subject="conversation title and turns"
          />
        </div>

        <div className="p-5 sm:p-6">
          <div
            tabIndex={0}
            role="region"
            aria-label="Conversation title and turns"
            className="flex max-h-96 flex-col gap-3 overflow-y-auto break-words rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 shadow-xs outline-none transition-all duration-200 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <p className="text-base font-bold leading-7 text-slate-900">
              {title}
            </p>

            {lines.map((line, index) => (
              <div
                key={line.id}
                className={`rounded-lg border px-3 py-2.5 ${SPEAKER_ROW_CLASSES[line.speaker]}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={SPEAKER_BADGE_VARIANTS[line.speaker]} size="sm">
                    {speakerNames[line.speaker]}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">
                    Turn {index + 1}
                  </span>
                </div>
                <p>{line.text}</p>
              </div>
            ))}
          </div>

          <ConversationPracticeControls practice={practice} />
        </div>
      </div>

      {practice.showIpa && (
        <ConversationIpaCard practice={practice} title={title} />
      )}
    </section>
  );
}
