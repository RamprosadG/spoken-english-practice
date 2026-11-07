"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import {
  ACCENT_OPTIONS,
  SPEED_OPTIONS,
} from "@/features/practice/useSpeechPractice";
import type { ListenSpeech } from "@/features/practice/useListenSpeech";

interface ListenControlsProps {
  speech: ListenSpeech;
  className?: string;
  stacked?: boolean;
  oneRow?: boolean;
}

export function ListenControls({
  speech,
  className = "",
  stacked = false,
  oneRow = false,
}: ListenControlsProps) {
  // Below `sm` a phone fits two of these dropdowns side by side, so `oneRow`
  // pairs the last two and leaves the first — Accent, whose value is the longest
  // of the three — a row of its own. That is the same parity rule the library
  // filter bars follow. `stacked` stays one control per row on purpose: its
  // caller puts the controls inside an even narrower card.
  const gridClasses = stacked
    ? "grid-cols-1"
    : oneRow
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`w-full ${className}`}>
      <div className={`grid gap-3 ${gridClasses}`}>
        <div className={oneRow && !stacked ? "col-span-2 sm:col-span-1" : ""}>
          <Dropdown
            label="Accent"
            value={speech.accent}
            onChange={speech.handleAccentChange}
            options={ACCENT_OPTIONS}
            hideOptionalText
            className="max-sm:text-xs"
          />
        </div>
        <div>
          <Dropdown
            label="Voice"
            value={speech.voice}
            onChange={speech.handleVoiceChange}
            options={speech.voiceOptions}
            placeholder="Automatic (best match)"
            hideOptionalText
            className="max-sm:text-xs"
          />
        </div>
        <div>
          <Dropdown
            label="Speed"
            value={speech.speed}
            onChange={speech.handleSpeedChange}
            options={SPEED_OPTIONS}
            hideOptionalText
            className="max-sm:text-xs"
          />
        </div>
      </div>

      {(speech.error || speech.notice) && (
        <p
          className={`mt-2 text-xs font-medium ${
            speech.error ? "text-red-600" : "text-amber-700"
          }`}
          role={speech.error ? "alert" : undefined}
          aria-live="polite"
        >
          {speech.error ?? speech.notice}
        </p>
      )}
    </div>
  );
}
