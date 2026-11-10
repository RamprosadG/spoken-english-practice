"use client";

import { useMemo } from "react";
import { ConversationPracticeControls } from "@/components/features/conversation/ConversationPracticeControls";
import {
  SPEAKER_NAME_TEXT_CLASSES,
  SPEAKER_RULE_CLASSES,
} from "@/components/features/conversation/speakerStyles";
import { useConversationPractice } from "@/components/features/conversation/useConversationPractice";
import { CopyTextButton } from "@/components/features/practice/CopyTextButton";
import type {
  ConversationLineItem,
  ConversationSpeaker,
} from "@/types/conversation";
import { QuestionIpaSection } from "./QuestionIpaSection";

const SPEAKER_NAMES: Record<ConversationSpeaker, string> = {
  one: "Interviewer",
  two: "Interviewee",
};

/** Which side of the exchange each turn is. */
const TURN_LABELS: Record<ConversationSpeaker, string> = {
  one: "Question",
  two: "Answer",
};

interface QuestionPracticeWorkspaceProps {
  question: string;
  answer: string;
}

export function QuestionPracticeWorkspace({
  question,
  answer,
}: QuestionPracticeWorkspaceProps) {
  const lines = useMemo<ConversationLineItem[]>(
    () => [
      { id: "question", text: question, sequence: 1, speaker: "one" },
      { id: "answer", text: answer, sequence: 2, speaker: "two" },
    ],
    [answer, question],
  );

  const practice = useConversationPractice({
    speaker1: SPEAKER_NAMES.one,
    speaker2: SPEAKER_NAMES.two,
    lines,
  });

  // The copy keeps the names because a pasted exchange needs them, while the
  // spoken utterances never include them.
  const copyText = useMemo(
    () =>
      `${SPEAKER_NAMES.one}: ${question}\n\n${SPEAKER_NAMES.two}: ${answer}`,
    [answer, question],
  );

  return (
    <section className="flex w-full flex-col">
      {/* The exchange leads the page in one fixed-height card, exactly as the
          presentation and conversation pages do: a model answer is long, and
          without the cap it would push the controls off the screen. Only the
          voices are marked by a hairline and a colour rather than a tinted box,
          and this is the page's single box. */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2 bg-slate-100 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Question And Answer
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Hear the question in the interviewer&apos;s voice, say your own
              answer out loud, then hear the model answer in the second.
            </p>
          </div>

          <CopyTextButton text={copyText} subject="Question And Answer" />
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Question And Answer"
          className="max-h-96 overflow-y-auto px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ol className="divide-y divide-slate-200">
            {practice.turns.map((turn) => (
              <li key={turn.key} className="py-5 first:pt-0 last:pb-0">
                <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
                  <span className={SPEAKER_NAME_TEXT_CLASSES[turn.speaker]}>
                    {turn.speakerName}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-slate-400">
                    {TURN_LABELS[turn.speaker]}
                  </span>
                </p>
                <p
                  className={`mt-1.5 max-w-prose break-words whitespace-pre-line border-l-2 pl-3 text-sm leading-6 text-slate-900 ${SPEAKER_RULE_CLASSES[turn.speaker]}`}
                >
                  {turn.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6">
        <ConversationPracticeControls practice={practice} />
      </div>

      {practice.showIpa && <QuestionIpaSection practice={practice} />}
    </section>
  );
}
