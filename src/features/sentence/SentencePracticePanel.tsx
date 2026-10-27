"use client";

import { InlineIpa } from "@/features/practice/InlineIpa";
import { ListenControls } from "@/features/practice/ListenControls";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import { useListenSpeech } from "@/features/practice/useListenSpeech";
import type { SentenceItem } from "@/types/sentence";

interface SentencePracticePanelProps {
  sentence: SentenceItem;
}

export function SentencePracticePanel({
  sentence,
}: SentencePracticePanelProps) {
  const speech = useListenSpeech();

  return (
    <div
      id={`sentence-practice-${sentence.id}`}
      className="border-t border-slate-200 px-4 py-5 sm:px-6 sm:py-6"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium leading-7 text-slate-900">
              {sentence.text}
            </p>

            <InlineIpa text={sentence.text} accent={speech.accent} />

            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Meaning (বাংলা)
              </p>
              <p lang="bn" className="mt-1 text-sm leading-7 text-slate-700">
                {sentence.meaning}
              </p>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-72">
            <ListenControls speech={speech} stacked />
            <PlayTextButton
              isPlaying={speech.speakingKey === "sentence"}
              onClick={() => speech.play("sentence", sentence.text)}
              ariaLabel="Listen to the sentence"
              className="mt-3 w-full justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
