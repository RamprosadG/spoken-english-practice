"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import {
  IPA_MODE_OPTIONS,
  type SpeechPractice,
} from "@/features/practice/useSpeechPractice";

interface IpaTranscriptionCardProps {
  practice: SpeechPractice;
}

export function IpaTranscriptionCard({ practice }: IpaTranscriptionCardProps) {
  const {
    ipa,
    ipaPairs,
    ipaMode,
    ipaStatus,
    ipaError,
    accentLabel,
    ipaModeLabel,
    handleIpaModeChange,
  } = practice;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            IPA transcription
          </h2>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-500">
            {accentLabel} · {ipaModeLabel}
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Dropdown
            label="IPA view"
            value={ipaMode}
            onChange={handleIpaModeChange}
            options={IPA_MODE_OPTIONS}
            hideOptionalText
          />
        </div>
      </div>

      <div className="p-5 sm:p-6" aria-live="polite">
        {ipaStatus === "loading" && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
              aria-hidden="true"
            />
            <span>Transcribing...</span>
          </div>
        )}

        {ipaStatus === "error" && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {ipaError}
          </p>
        )}

        {ipaStatus === "idle" && (
          <p className="text-sm text-slate-500">
            Enter some English text to see its IPA transcription.
          </p>
        )}

        {ipaStatus === "ready" &&
          ipaMode === "sentence" &&
          (ipaPairs.length > 0 ? (
            <div className="space-y-4">
              {ipaPairs.map((pair, index) => (
                <div
                  key={`${index}-${pair.source.slice(0, 24)}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-medium leading-6 text-slate-900">
                    {pair.source}
                  </p>
                  <p className="mt-1.5 break-words font-mono text-[15px] leading-7 text-indigo-700">
                    {pair.ipa}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No IPA transcription is available for this text.
            </p>
          ))}

        {ipaStatus === "ready" &&
          ipaMode === "full" &&
          (ipa ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="break-words font-mono text-base leading-8 text-indigo-700">
                {ipa}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No IPA transcription is available for this text.
            </p>
          ))}
      </div>
    </div>
  );
}
