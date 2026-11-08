"use client";

import { useMemo } from "react";
import {
  SPEAKER_NAME_TEXT_CLASSES,
  SPEAKER_RULE_CLASSES,
} from "@/features/conversation/speakerStyles";
import type { ConversationPractice } from "@/features/conversation/useConversationPractice";
import { InlineIpa } from "@/features/practice/InlineIpa";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import { splitIntoSentences } from "@/features/practice/splitSentences";
import type { ConversationSpeaker } from "@/types/conversation";

/** Which side of the exchange each sentence came from. */
const TURN_LABELS: Record<ConversationSpeaker, string> = {
  one: "Question",
  two: "Answer",
};

interface InterviewQuestionIpaSectionProps {
  practice: ConversationPractice;
}

/**
 * The transcription is read sentence by sentence, as on the presentation and
 * conversation pages: one hairline row per sentence, its IPA under it, and a
 * Listen button that speaks only that sentence — in the voice its own speaker
 * uses, which is the one thing a monologue's list never has to decide.
 */
export function InterviewQuestionIpaSection({
  practice,
}: InterviewQuestionIpaSectionProps) {
  const { accent, turns, playingRowKey, handlePlaySentence } = practice;

  const rows = useMemo(
    () =>
      turns.flatMap((turn) => {
        const sentences = splitIntoSentences(turn.text);

        return sentences.map((sentence, index) => ({
          key: `${turn.key}-${index}`,
          sentence,
          index,
          total: sentences.length,
          turnIndex: turn.index,
          speaker: turn.speaker,
          speakerName: turn.speakerName,
        }));
      }),
    [turns],
  );

  return (
    <section
      aria-labelledby="interview-ipa"
      className="mt-6 border-t border-slate-200 pt-6"
    >
      <h2
        id="interview-ipa"
        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        IPA Transcription
      </h2>
      <p className="mt-1.5 text-sm text-slate-500">
        Every sentence uses the selected accent, in the voice of the side that
        says it.
      </p>

      <ol className="mt-4 divide-y divide-slate-200">
        {rows.map((row) => (
          <li key={row.key} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
                  <span className={SPEAKER_NAME_TEXT_CLASSES[row.speaker]}>
                    {row.speakerName}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-slate-400">
                    {TURN_LABELS[row.speaker]}
                    {row.total > 1 ? ` Sentence ${row.index + 1}` : ""}
                  </span>
                </p>

                <p
                  className={`mt-1.5 max-w-prose break-words border-l-2 pl-3 text-sm font-medium leading-6 text-slate-900 ${SPEAKER_RULE_CLASSES[row.speaker]}`}
                >
                  {row.sentence}
                </p>
                <InlineIpa text={row.sentence} accent={accent} />
              </div>

              <PlayTextButton
                isPlaying={playingRowKey === row.key}
                onClick={() =>
                  handlePlaySentence(row.turnIndex, row.sentence, row.key)
                }
                ariaLabel={`Listen To ${TURN_LABELS[row.speaker]}${
                  row.total > 1 ? ` Sentence ${row.index + 1}` : ""
                }`}
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
