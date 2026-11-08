"use client";

import { FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import { RiLoopRightLine } from "react-icons/ri";
import Button from "@/components/ui/buttons/Button";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import {
  ACCENT_OPTIONS,
  SPEED_OPTIONS,
  type SpeechPractice,
} from "@/features/practice/useSpeechPractice";

interface SpeechPracticeControlsProps {
  practice: SpeechPractice;
}

export function SpeechPracticeControls({
  practice,
}: SpeechPracticeControlsProps) {
  const {
    accent,
    voice,
    voiceOptions,
    speed,
    showIpa,
    repeat,
    speechStatus,
    speechError,
    playbackNotice,
    isSpeaking,
    speechLabel,
    statusDotClass,
    hasText,
    handleAccentChange,
    handleVoiceChange,
    handleSpeedChange,
    handleShowIpaChange,
    handleRepeatChange,
    handleStartPause,
    handleReset,
  } = practice;

  return (
    <>
      {/* The filter-bar parity rule sizes this field: four controls, so a phone
          gets two per row rather than a stack, and `xl` brings all four back into
          one row. The caller owns the top margin, because this row now sits below
          a card on the presentation page instead of inside one. */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Dropdown
          label="Accent"
          value={accent}
          onChange={handleAccentChange}
          options={ACCENT_OPTIONS}
          hideOptionalText
          className="max-sm:text-xs"
        />

        <Dropdown
          label="Voice"
          value={voice}
          onChange={handleVoiceChange}
          options={voiceOptions}
          placeholder="Automatic (Best Match)"
          hideOptionalText
          className="max-sm:text-xs"
        />

        <Dropdown
          label="Speed"
          value={speed}
          onChange={handleSpeedChange}
          options={SPEED_OPTIONS}
          hideOptionalText
          className="max-sm:text-xs"
        />

        <div className="flex w-full flex-col gap-1">
          <span className="text-sm font-medium text-slate-800 max-sm:text-xs">
            IPA Translation
          </span>
          <label className="flex h-[38px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3.5 shadow-xs transition-all duration-200 hover:border-indigo-400">
            <span className="text-sm font-medium text-slate-900 max-sm:text-xs">
              Show IPA
            </span>
            <span className="relative inline-flex shrink-0">
              <input
                type="checkbox"
                checked={showIpa}
                onChange={(event) =>
                  handleShowIpaChange(event.target.checked)
                }
                className="peer sr-only"
              />
              <span className="block h-5 w-9 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2" />
              <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* One row on a phone, three even halves of it, and Repeat carries its
              label like its two neighbours instead of standing as an icon. */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={speechStatus === "idle"}
              icon={<FiRotateCcw className="h-4 w-4" />}
              className="max-sm:flex-1 max-sm:gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleStartPause}
              disabled={!hasText}
              icon={
                isSpeaking ? (
                  <FiPause className="h-4 w-4" />
                ) : (
                  <FiPlay className="h-4 w-4" />
                )
              }
              className="max-sm:flex-1 max-sm:gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
            >
              {isSpeaking ? "Pause" : "Start"}
            </Button>
            <Button
              type="button"
              variant={repeat ? "secondary" : "white"}
              onClick={() => handleRepeatChange(!repeat)}
              aria-pressed={repeat}
              title="Repeat"
              icon={<RiLoopRightLine className="h-4 w-4" />}
              className="border-slate-400 max-sm:flex-1 max-sm:gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
            >
              Repeat
            </Button>
          </div>

          <div className="min-w-0 lg:text-right" aria-live="polite">
            <div className="flex items-center gap-2 lg:justify-end">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass}`}
                aria-hidden="true"
              />
              <p
                className={`text-sm font-medium ${
                  speechError ? "text-red-600" : "text-slate-700"
                }`}
                role={speechError ? "alert" : undefined}
              >
                {speechError ?? speechLabel}
              </p>
            </div>
            {playbackNotice && (
              <p className="mt-1 text-xs text-amber-700">{playbackNotice}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Voices are provided by your browser and operating system.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
