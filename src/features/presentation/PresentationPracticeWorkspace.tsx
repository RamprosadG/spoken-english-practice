"use client";

import { CopyTextButton } from "@/features/practice/CopyTextButton";
import { IpaTranscriptionCard } from "@/features/practice/IpaTranscriptionCard";
import { SpeechPracticeControls } from "@/features/practice/SpeechPracticeControls";
import { useSpeechPractice } from "@/features/practice/useSpeechPractice";

interface PresentationPracticeWorkspaceProps {
  text: string;
}

export function PresentationPracticeWorkspace({
  text,
}: PresentationPracticeWorkspaceProps) {
  const practice = useSpeechPractice(text);

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Presentation text
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Read the saved text, then view its IPA transcription or listen to
              it in your chosen accent.
            </p>
          </div>

          <CopyTextButton text={text} subject="presentation text" />
        </div>

        <div className="p-5 sm:p-6">
          <div
            tabIndex={0}
            role="region"
            aria-label="Presentation text"
            className="max-h-96 overflow-y-auto break-words rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 shadow-xs outline-none transition-all duration-200 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <p className="whitespace-pre-wrap">{text}</p>
          </div>

          <SpeechPracticeControls practice={practice} />
        </div>
      </div>

      {practice.showIpa && <IpaTranscriptionCard practice={practice} />}
    </section>
  );
}
