"use client";

import { useMemo } from "react";
import Badge from "@/components/ui/badges/Badge";
import { ConversationPracticeControls } from "@/features/conversation/ConversationPracticeControls";
import {
  SPEAKER_BADGE_VARIANTS,
  SPEAKER_ROW_CLASSES,
} from "@/features/conversation/speakerStyles";
import { useConversationPractice } from "@/features/conversation/useConversationPractice";
import { CopyTextButton } from "@/features/practice/CopyTextButton";
import type {
  ConversationLineItem,
  ConversationSpeaker,
} from "@/types/conversation";
import { InterviewQuestionIpaCard } from "./InterviewQuestionIpaCard";

const SPEAKER_NAMES: Record<ConversationSpeaker, string> = {
  one: "Interviewer",
  two: "Interviewee",
};

/** Which side of the exchange each turn is. */
const TURN_LABELS: Record<ConversationSpeaker, string> = {
  one: "Question",
  two: "Answer",
};

interface InterviewQuestionPracticeWorkspaceProps {
  question: string;
  answer: string;
}

export function InterviewQuestionPracticeWorkspace({
  question,
  answer,
}: InterviewQuestionPracticeWorkspaceProps) {
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
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Question and answer
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Hear the question in the interviewer&apos;s voice, say your own
              answer out loud, then hear the model answer in the second.
            </p>
          </div>

          <CopyTextButton
            text={copyText}
            subject="question and answer"
          />
        </div>

        <div className="p-5 sm:p-6">
          <div
            tabIndex={0}
            role="region"
            aria-label="Question and answer"
            className="flex max-h-96 flex-col gap-3 overflow-y-auto break-words rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 shadow-xs outline-none transition-all duration-200 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {lines.map((line) => (
              <div
                key={line.id}
                className={`rounded-lg border px-3 py-2.5 ${SPEAKER_ROW_CLASSES[line.speaker]}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Badge
                    variant={SPEAKER_BADGE_VARIANTS[line.speaker]}
                    size="sm"
                  >
                    {SPEAKER_NAMES[line.speaker]}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">
                    {TURN_LABELS[line.speaker]}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{line.text}</p>
              </div>
            ))}
          </div>

          <ConversationPracticeControls practice={practice} />
        </div>
      </div>

      {practice.showIpa && <InterviewQuestionIpaCard practice={practice} />}
    </section>
  );
}
