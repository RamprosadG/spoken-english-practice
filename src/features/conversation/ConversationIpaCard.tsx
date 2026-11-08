"use client";

import { InlineIpa } from "@/features/practice/InlineIpa";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import {
  SPEAKER_NAME_TEXT_CLASSES,
  SPEAKER_RULE_CLASSES,
} from "./speakerStyles";
import type { ConversationPractice } from "./useConversationPractice";

interface ConversationIpaCardProps {
  practice: ConversationPractice;
}

export function ConversationIpaCard({
  practice,
}: ConversationIpaCardProps) {
  const { accent, playingTurnIndex, handlePlayTurn, turns } = practice;

  return (
    <section
      aria-labelledby="conversation-ipa"
      className="mt-6 border-t border-slate-200 pt-6"
    >
      <h2
        id="conversation-ipa"
        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        IPA Transcription
      </h2>
      <p className="mt-1.5 text-sm text-slate-500">
        Every turn uses the selected accent.
      </p>

      {/* Same row shape as the turn list above, so the two read as one list
          seen twice: the caption carries the voice, the rule keeps it, and the
          only additions are the transcription and this turn's Listen button. */}
      <ol className="mt-4 divide-y divide-slate-200">
        {turns.map((turn) => (
          <li key={turn.key} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
                <span className={SPEAKER_NAME_TEXT_CLASSES[turn.speaker]}>
                  {turn.speakerName}
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="text-slate-400">Turn {turn.index + 1}</span>
              </p>

              <PlayTextButton
                isPlaying={playingTurnIndex === turn.index}
                onClick={() => handlePlayTurn(turn.index)}
                ariaLabel={`Listen To Turn ${turn.index + 1}, ${turn.speakerName}`}
              />
            </div>

            <p
              className={`mt-1.5 max-w-prose break-words border-l-2 pl-3 text-sm leading-6 text-slate-900 ${SPEAKER_RULE_CLASSES[turn.speaker]}`}
            >
              {turn.text}
            </p>
            <InlineIpa text={turn.text} accent={accent} />
          </li>
        ))}
      </ol>
    </section>
  );
}
