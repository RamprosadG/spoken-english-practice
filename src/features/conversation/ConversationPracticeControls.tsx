"use client";

import { FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import { RiLoopRightLine } from "react-icons/ri";
import Button from "@/components/ui/buttons/Button";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import type { ConversationSpeaker } from "@/types/conversation";
import {
  ACCENT_OPTIONS,
  SPEED_OPTIONS,
  type ConversationPractice,
} from "./useConversationPractice";

const SPEAKERS: ConversationSpeaker[] = ["one", "two"];

interface ConversationPracticeControlsProps {
  practice: ConversationPractice;
}

export function ConversationPracticeControls({
  practice,
}: ConversationPracticeControlsProps) {
  const {
    accent,
    pickedVoices,
    speed,
    showIpa,
    repeat,
    speechStatus,
    speechError,
    playbackNotice,
    isSpeaking,
    speechLabel,
    statusDotClass,
    hasTurns,
    voiceOptions,
    handleAccentChange,
    handleVoiceChange,
    handleSpeedChange,
    handleShowIpaChange,
    handleRepeatChange,
    handleStartPause,
    handleReset,
  } = practice;

  const speakerNames: Record<ConversationSpeaker, string> = {
    one:
      practice.turns.find((turn) => turn.speaker === "one")?.speakerName ??
      "Speaker 1",
    two:
      practice.turns.find((turn) => turn.speaker === "two")?.speakerName ??
      "Speaker 2",
  };

  // The filter-bar parity rule sizes the first row: Accent, Speed and the IPA
  // switch, with Accent taking the whole phone row and the other two pairing
  // under it. From sm all three sit side by side. The two Voice picks then take
  // a row of their own at every width, each half of it.
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <Dropdown
            label="Accent (both speakers)"
            value={accent}
            onChange={handleAccentChange}
            options={ACCENT_OPTIONS}
            hideOptionalText
            className="max-sm:text-xs"
          />
        </div>

        <div>
          <Dropdown
            label="Speed"
            value={speed}
            onChange={handleSpeedChange}
            options={SPEED_OPTIONS}
            hideOptionalText
            className="max-sm:text-xs"
          />
        </div>

        <div className="flex w-full flex-col gap-1">
          <span className="text-sm font-medium text-slate-800 max-sm:text-xs">
            IPA translation
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

        {/* The two voices own a full-width row: Accent, Speed and the IPA switch
            fill the three columns above them, so pairing the speakers underneath
            leaves each picker half the row — wide enough for a long voice name on
            a large screen instead of a third-width cell with a gap beside it. */}
        <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-3">
          {SPEAKERS.map((speaker) => (
            <Dropdown
              key={speaker}
              label={`Voice (${speakerNames[speaker]})`}
              value={pickedVoices[speaker]}
              onChange={(value) => handleVoiceChange(speaker, value)}
              options={voiceOptions}
              placeholder="Automatic (best match)"
              hideOptionalText
              className="max-sm:text-xs"
            />
          ))}
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
              disabled={!hasTurns}
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
                {speechLabel}
              </p>
            </div>
            {playbackNotice && (
              <p className="mt-1 text-xs text-amber-700">{playbackNotice}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Voices are provided by your browser and operating system. The
              speaker names are labels only and are never read aloud.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
