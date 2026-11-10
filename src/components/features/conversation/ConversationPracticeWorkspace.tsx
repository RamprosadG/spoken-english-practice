"use client";

import { useMemo } from "react";
import { CopyTextButton } from "@/components/features/practice/CopyTextButton";
import type { ConversationLineItem } from "@/types/conversation";
import { ConversationIpaCard } from "./ConversationIpaCard";
import { ConversationPracticeControls } from "./ConversationPracticeControls";
import {
  SPEAKER_NAME_TEXT_CLASSES,
  SPEAKER_RULE_CLASSES,
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
    <section className="flex w-full flex-col">
      {/* The material comes first, in one fixed-height card, so a long dialogue
          scrolls inside it instead of pushing the controls off the screen. The
          title is the page heading's job and is not repeated here; a turn row is
          a divide-y line with a left rule in its speaker's colour rather than a
          tinted box, and only this one box surrounds it. */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2 bg-slate-100 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Conversation Turns
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Follow the turns in order, then listen with one voice per speaker
              in your chosen accent.
            </p>
          </div>

          <CopyTextButton
            text={copyText}
            subject="Conversation Title And Turns"
          />
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Conversation Turns"
          className="max-h-96 overflow-y-auto px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ol className="divide-y divide-slate-200">
            {lines.map((line, index) => (
              <li key={line.id} className="py-5 first:pt-0 last:pb-0">
                <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
                  <span className={SPEAKER_NAME_TEXT_CLASSES[line.speaker]}>
                    {speakerNames[line.speaker]}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-slate-400">Turn {index + 1}</span>
                </p>
                <p
                  className={`mt-1.5 max-w-prose break-words border-l-2 pl-3 text-sm leading-6 text-slate-900 ${SPEAKER_RULE_CLASSES[line.speaker]}`}
                >
                  {line.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6">
        <ConversationPracticeControls practice={practice} />
      </div>

      {practice.showIpa && <ConversationIpaCard practice={practice} />}
    </section>
  );
}
