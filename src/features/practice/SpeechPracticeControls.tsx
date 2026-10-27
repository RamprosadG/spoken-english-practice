"use client";

import { FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
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
    speed,
    showIpa,
    speechStatus,
    speechError,
    playbackNotice,
    isSpeaking,
    isPaused,
    speechLabel,
    statusDotClass,
    hasText,
    handleAccentChange,
    handleSpeedChange,
    handleShowIpaChange,
    handleStart,
    handlePause,
    handleReset,
  } = practice;

  return (
    <>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Dropdown
          label="Accent"
          value={accent}
          onChange={handleAccentChange}
          options={ACCENT_OPTIONS}
          hideOptionalText
        />

        <Dropdown
          label="Speed"
          value={speed}
          onChange={handleSpeedChange}
          options={SPEED_OPTIONS}
          hideOptionalText
        />

        <div className="flex w-full flex-col gap-1">
          <span className="text-sm font-medium text-slate-800">
            IPA translation
          </span>
          <label className="flex h-[38px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3.5 shadow-xs transition-all duration-200 hover:border-indigo-400">
            <span className="text-sm font-medium text-slate-900">Show IPA</span>
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
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <Button
              type="button"
              onClick={handleStart}
              disabled={!hasText}
              icon={<FiPlay className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              {isPaused ? "Resume" : "Start"}
            </Button>
            <Button
              type="button"
              variant="white"
              onClick={handlePause}
              disabled={!isSpeaking}
              icon={<FiPause className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Pause
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={speechStatus === "idle"}
              icon={<FiRotateCcw className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Reset
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
