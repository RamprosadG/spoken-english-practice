"use client";

import { useMemo } from "react";
import { CopyTextButton } from "@/components/features/practice/CopyTextButton";
import { IpaTranscriptionSection } from "@/components/features/practice/IpaTranscriptionSection";
import { SpeechPracticeControls } from "@/components/features/practice/SpeechPracticeControls";
import { useSpeechPractice } from "@/components/features/practice/useSpeechPractice";
import type { ListeningItem } from "@/types/listening";

interface ListeningTranscriptionWorkspaceProps {
  items: ListeningItem[];
}

/**
 * The listening read the way the presentation page reads: the whole text in one
 * fixed-height card, the accent, voice, speed and playback controls under it,
 * and the sentence-by-sentence IPA transcription under those. Closing this tab
 * unmounts the workspace, which is what puts the audio down.
 */
export function ListeningTranscriptionWorkspace({
  items,
}: ListeningTranscriptionWorkspaceProps) {
  // One stored sentence per line, so the paragraph shows the same breaks the
  // learner hears and the shared splitter still finds one sentence per row.
  const text = useMemo(() => items.map((item) => item.text).join("\n"), [items]);
  const practice = useSpeechPractice(text);

  return (
    <section className="flex w-full flex-col">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between bg-slate-100 gap-2 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Full Transcription
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Read every sentence in order, play the whole listening in your
              chosen accent, or open the transcription and play them one by one.
            </p>
          </div>

          <CopyTextButton text={text} subject="Listening Transcription" />
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Full Transcription"
          className="max-h-96 overflow-y-auto px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <p className="break-words text-sm leading-6 whitespace-pre-wrap text-slate-900">
            {text}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <SpeechPracticeControls practice={practice} />
      </div>

      {practice.showIpa && <IpaTranscriptionSection practice={practice} />}
    </section>
  );
}
