"use client";

import Badge from "@/components/ui/badges/Badge";
import { InlineIpa } from "@/features/practice/InlineIpa";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import {
  SPEAKER_BADGE_VARIANTS,
  SPEAKER_ROW_CLASSES,
} from "./speakerStyles";
import type { ConversationPractice } from "./useConversationPractice";

interface ConversationIpaCardProps {
  practice: ConversationPractice;
  title: string;
}

export function ConversationIpaCard({
  practice,
  title,
}: ConversationIpaCardProps) {
  const { accent, playingTurnIndex, handlePlayTurn, turns } = practice;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">
          IPA transcription
        </h2>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-500">
          Every turn uses the selected accent
        </p>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="mb-1.5">
            <Badge variant="neutral" size="sm">
              Title
            </Badge>
          </p>
          <p className="text-sm font-semibold leading-6 text-slate-900">
            {title}
          </p>
        </div>

        {turns.map((turn) => (
          <div
            key={turn.key}
            className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 ${SPEAKER_ROW_CLASSES[turn.speaker]}`}
          >
            <div className="min-w-0">
              <p className="mb-1.5">
                <Badge variant={SPEAKER_BADGE_VARIANTS[turn.speaker]} size="sm">
                  {turn.speakerName}
                </Badge>
              </p>
              <p className="text-sm leading-6 font-medium text-slate-900">
                {turn.text}
              </p>
              <InlineIpa text={turn.text} accent={accent} />
            </div>

            <PlayTextButton
              isPlaying={playingTurnIndex === turn.index}
              onClick={() => handlePlayTurn(turn.index)}
              ariaLabel={`Listen to turn ${turn.index + 1}, ${turn.speakerName}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
