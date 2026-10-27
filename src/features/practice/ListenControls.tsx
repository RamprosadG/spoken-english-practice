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
}

export function ListenControls({
  speech,
  className = "",
  stacked = false,
}: ListenControlsProps) {
  return (
    <div className={`w-full ${className}`}>
      <div
        className={`grid grid-cols-1 gap-3 ${stacked ? "" : "sm:grid-cols-2"}`}
      >
        <Dropdown
          label="Accent"
          value={speech.accent}
          onChange={speech.handleAccentChange}
          options={ACCENT_OPTIONS}
          hideOptionalText
        />
        <Dropdown
          label="Speed"
          value={speech.speed}
          onChange={speech.handleSpeedChange}
          options={SPEED_OPTIONS}
          hideOptionalText
        />
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
