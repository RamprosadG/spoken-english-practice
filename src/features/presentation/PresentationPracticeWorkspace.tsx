"use client";

import { CopyTextButton } from "@/features/practice/CopyTextButton";
import { IpaTranscriptionSection } from "@/features/practice/IpaTranscriptionSection";
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
    <section className="flex w-full flex-col">
      {/* The material comes first, in one fixed-height card, so a long talk
          scrolls inside it instead of pushing the controls off the screen. The
          title is the page heading's job and is not repeated here, and only this
          one box surrounds the text. */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-5 py-4">
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

        <div
          tabIndex={0}
          role="region"
          aria-label="Presentation text"
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
