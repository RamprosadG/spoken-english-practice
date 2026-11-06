"use client";

import Badge from "@/components/ui/badges/Badge";
import { InlineIpa } from "@/features/practice/InlineIpa";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import {
  SPEAKER_BADGE_VARIANTS,
  SPEAKER_ROW_CLASSES,
} from "@/features/conversation/speakerStyles";
import type { ConversationPractice } from "@/features/conversation/useConversationPractice";
import type { ConversationSpeaker } from "@/types/conversation";

/** Which side of the exchange each turn is, so the row labels name the content. */
const TURN_LABELS: Record<ConversationSpeaker, string> = {
  one: "Question",
  two: "Answer",
};

interface InterviewQuestionIpaCardProps {
  practice: ConversationPractice;
}

export function InterviewQuestionIpaCard({
  practice,
}: InterviewQuestionIpaCardProps) {
  const { accent, playingTurnIndex, handlePlayTurn, turns } = practice;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">
          IPA transcription
        </h2>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-500">
          Both sides use the selected accent
        </p>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {turns.map((turn) => (
          <div
            key={turn.key}
            className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 ${SPEAKER_ROW_CLASSES[turn.speaker]}`}
          >
            <div className="min-w-0">
              <p className="mb-1.5 flex items-center gap-2">
                <Badge variant={SPEAKER_BADGE_VARIANTS[turn.speaker]} size="sm">
                  {turn.speakerName}
                </Badge>
                <span className="text-xs font-medium text-slate-500">
                  {TURN_LABELS[turn.speaker]}
                </span>
              </p>
              <p className="text-sm leading-6 font-medium whitespace-pre-wrap text-slate-900">
                {turn.text}
              </p>
              <InlineIpa text={turn.text} accent={accent} />
            </div>

            <PlayTextButton
              isPlaying={playingTurnIndex === turn.index}
              onClick={() => handlePlayTurn(turn.index)}
              ariaLabel={`Listen to the ${TURN_LABELS[turn.speaker].toLowerCase()}, ${turn.speakerName}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
