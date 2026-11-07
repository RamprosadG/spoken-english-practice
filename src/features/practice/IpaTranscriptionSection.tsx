"use client";

import { PlayTextButton } from "@/features/practice/PlayTextButton";
import type { SpeechPractice } from "@/features/practice/useSpeechPractice";

interface IpaTranscriptionSectionProps {
  practice: SpeechPractice;
}

/**
 * The conversation IPA list's row shape — hairline-separated sentences, the
 * transcription under each one, and a Listen button per sentence — without the
 * speaker caption, because a monologue has one voice and no turns.
 */
export function IpaTranscriptionSection({
  practice,
}: IpaTranscriptionSectionProps) {
  const {
    ipaPairs,
    ipaStatus,
    ipaError,
    playingSentenceIndex,
    handlePlaySentence,
  } = practice;

  const notice =
    ipaStatus === "loading"
      ? "Transcribing…"
      : ipaStatus === "error"
        ? (ipaError ?? "Could not generate the IPA transcription.")
        : ipaStatus === "idle"
          ? "There is no text to transcribe yet."
          : ipaPairs.length > 0
            ? "Every sentence uses the selected accent."
            : "No IPA transcription is available for this text.";

  return (
    <section
      aria-labelledby="ipa-transcription"
      className="mt-6 border-t border-slate-200 pt-6"
    >
      <h2
        id="ipa-transcription"
        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
      >
        IPA transcription
      </h2>
      <p className="mt-1.5 text-sm text-slate-500" aria-live="polite">
        {notice}
      </p>

      {ipaStatus === "ready" && ipaPairs.length > 0 && (
        <ol className="mt-4 divide-y divide-slate-200">
          {ipaPairs.map((pair, index) => (
            <li
              key={`${index}-${pair.source.slice(0, 24)}`}
              className="py-5 first:pt-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="max-w-prose break-words text-sm font-medium leading-6 text-slate-900">
                    {pair.source}
                  </p>
                  {/* The same 13 px mono line the library lists print, so one
                    IPA style serves every page. */}
                  <p className="mt-1 max-w-prose break-words font-mono text-[13px] leading-6 text-indigo-700">
                    {pair.ipa || "—"}
                  </p>
                </div>

                <PlayTextButton
                  isPlaying={playingSentenceIndex === index}
                  onClick={() => handlePlaySentence(index)}
                  ariaLabel={`Listen to sentence ${index + 1}`}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
