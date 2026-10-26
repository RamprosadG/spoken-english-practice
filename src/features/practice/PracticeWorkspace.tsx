"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import Button from "@/components/ui/buttons/Button";
import Dropdown from "@/components/ui/dropdowns/Dropdown";

type Accent = "en-GB" | "en-US";
type Speed = "0.5" | "0.75" | "1" | "1.25" | "1.5";
type IpaMode = "sentence" | "full";
type SpeechStatus = "idle" | "speaking" | "paused";
type IpaStatus = "idle" | "loading" | "ready" | "error";

interface IpaPair {
  source: string;
  ipa: string;
}

const ALWAYS_JOIN_ABBREVIATIONS = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "sr",
  "jr",
  "st",
  "vs",
]);

const CONDITIONAL_JOIN_ABBREVIATIONS = new Set([
  "e.g",
  "i.e",
  "a.m",
  "p.m",
  "u.s",
  "u.k",
  "jan",
  "feb",
  "mar",
  "apr",
  "jun",
  "jul",
  "aug",
  "sep",
  "sept",
  "oct",
  "nov",
  "dec",
]);

function needsContinuation(sentence: string, next: string): boolean {
  const withoutClosing = sentence.replace(/["'”’)\]]+$/, "");
  if (!withoutClosing.endsWith(".")) return false;

  const token = withoutClosing.slice(0, -1).trim();
  const rawLastWord = token.split(/\s+/).pop() ?? token;
  const lastWord = rawLastWord.toLowerCase();
  const nextStartsLowerOrDigit = /^[a-z0-9]/.test(next);

  if (ALWAYS_JOIN_ABBREVIATIONS.has(lastWord)) return true;
  if (/^[A-Z]$/.test(rawLastWord) && token.length === 1) return true;
  if (/^\d+\.$/.test(withoutClosing)) return true;
  if (CONDITIONAL_JOIN_ABBREVIATIONS.has(lastWord)) {
    return nextStartsLowerOrDigit;
  }

  return false;
}

function splitIntoSentences(text: string): string[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  const sentences: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;

    for (const { segment } of segmenter.segment(line)) {
      const sentence = segment.trim();
      if (!sentence) continue;

      const previous = sentences[sentences.length - 1];
      if (previous && needsContinuation(previous, sentence)) {
        sentences[sentences.length - 1] = `${previous} ${sentence}`;
      } else {
        sentences.push(sentence);
      }
    }
  }

  return sentences;
}

const ACCENT_OPTIONS = [
  { value: "en-GB", label: "British English (en-GB)" },
  { value: "en-US", label: "American English (en-US)" },
];

const SPEED_OPTIONS = [
  { value: "0.5", label: "0.5× (Slow)" },
  { value: "0.75", label: "0.75×" },
  { value: "1", label: "1× (Normal)" },
  { value: "1.25", label: "1.25×" },
  { value: "1.5", label: "1.5× (Fast)" },
];

const IPA_MODE_OPTIONS = [
  { value: "sentence", label: "Sentence by sentence" },
  { value: "full", label: "Full translation" },
];

const TEXT_STORAGE_KEY = "spoken-english-practice:text";

function readStoredText(): string {
  try {
    return window.localStorage.getItem(TEXT_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function readServerText(): string {
  return "";
}

function subscribeToStoredText(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function persistText(value: string) {
  try {
    if (value) {
      window.localStorage.setItem(TEXT_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(TEXT_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode or blocked site data).
  }
}

const ACCENT_LABELS: Record<Accent, string> = {
  "en-GB": "British English",
  "en-US": "American English",
};

function findAccentVoice(
  voices: SpeechSynthesisVoice[],
  accent: Accent
): SpeechSynthesisVoice | null {
  return (
    voices.find(
      (voice) => voice.lang.replace("_", "-").toLowerCase() === accent.toLowerCase()
    ) ?? null
  );
}

export function PracticeWorkspace() {
  const storedText = useSyncExternalStore(
    subscribeToStoredText,
    readStoredText,
    readServerText
  );
  const [editedText, setEditedText] = useState<string | null>(null);
  const text = editedText ?? storedText;
  const [accent, setAccent] = useState<Accent>("en-GB");
  const [speed, setSpeed] = useState<Speed>("1");
  const [showIpa, setShowIpa] = useState(false);
  const [ipaMode, setIpaMode] = useState<IpaMode>("sentence");
  const [ipa, setIpa] = useState("");
  const [ipaPairs, setIpaPairs] = useState<IpaPair[]>([]);
  const [ipaStatus, setIpaStatus] = useState<IpaStatus>("idle");
  const [ipaError, setIpaError] = useState<string | null>(null);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>("idle");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!showIpa) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const trimmed = text.trim();

      if (!trimmed) {
        if (cancelled) return;
        setIpa("");
        setIpaPairs([]);
        setIpaError(null);
        setIpaStatus("idle");
        return;
      }

      if (!cancelled) {
        setIpaStatus("loading");
        setIpaError(null);
      }

      try {
        const { phonemize } = await import("phonemize");
        const transcription = phonemize(trimmed, accent);
        const sentenceTranscriptions = splitIntoSentences(trimmed).map(
          (sentence) => ({ source: sentence, ipa: phonemize(sentence, accent) })
        );

        if (!cancelled) {
          setIpa(transcription);
          setIpaPairs(sentenceTranscriptions);
          setIpaStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setIpa("");
          setIpaPairs([]);
          setIpaStatus("error");
          setIpaError("Could not generate the IPA transcription. Please try again.");
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, accent, showIpa]);

  const stopSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    activeUtteranceRef.current = null;
    window.speechSynthesis.cancel();
    setSpeechStatus("idle");
    setSpeechError(null);
  };

  const handleTextChange = (value: string) => {
    setEditedText(value);
    persistText(value);
    setPlaybackNotice(null);
    if (showIpa) {
      setIpaStatus("loading");
    }
    if (speechStatus !== "idle") {
      stopSpeech();
    }
  };

  const handleAccentChange = (value: string) => {
    if (value === accent) return;

    setAccent(value as Accent);
    setPlaybackNotice(null);
    if (showIpa) {
      setIpaStatus("loading");
    }
    if (speechStatus !== "idle") {
      stopSpeech();
    }
  };

  const handleSpeedChange = (value: string) => {
    if (value === speed) return;

    setSpeed(value as Speed);

    if (speechStatus !== "idle") {
      stopSpeech();
      setPlaybackNotice(
        `Speed changed to ${value}×. Press Start to play the text again at the new speed.`
      );
    } else {
      setPlaybackNotice(null);
    }
  };

  const handleShowIpaChange = (checked: boolean) => {
    setShowIpa(checked);

    if (!checked) {
      setIpa("");
      setIpaPairs([]);
      setIpaStatus("idle");
      setIpaError(null);
    }
  };

  const handleStart = () => {
    if (!text.trim()) {
      setSpeechError("Enter some English text first.");
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Speech playback is not supported in this browser.");
      return;
    }

    const synthesis = window.speechSynthesis;
    setSpeechError(null);

    if (speechStatus === "paused") {
      synthesis.resume();
      setSpeechStatus("speaking");
      return;
    }

    activeUtteranceRef.current = null;
    synthesis.cancel();
    setPlaybackNotice(null);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = Number(speed);

    const voice = findAccentVoice(voicesRef.current, accent);
    if (voice) {
      utterance.voice = voice;
    } else {
      setPlaybackNotice(
        `No ${ACCENT_LABELS[accent]} voice was found; your browser will use its default English voice.`
      );
    }

    utterance.onend = () => {
      if (activeUtteranceRef.current === utterance) {
        activeUtteranceRef.current = null;
        setSpeechStatus("idle");
      }
    };

    utterance.onerror = (event) => {
      if (activeUtteranceRef.current !== utterance) return;

      activeUtteranceRef.current = null;
      setSpeechStatus("idle");

      if (event.error !== "interrupted" && event.error !== "canceled") {
        setSpeechError("The browser could not play this text. Please try again.");
      }
    };

    activeUtteranceRef.current = utterance;
    synthesis.speak(utterance);
    setSpeechStatus("speaking");
  };

  const handlePause = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (speechStatus === "speaking") {
      window.speechSynthesis.pause();
      setSpeechStatus("paused");
    }
  };

  const handleReset = () => {
    stopSpeech();
    setPlaybackNotice(null);
  };

  const isSpeaking = speechStatus === "speaking";
  const isPaused = speechStatus === "paused";
  const speechLabel = isSpeaking
    ? `Speaking in ${ACCENT_LABELS[accent]} at ${speed}×.`
    : isPaused
      ? "Playback paused."
      : "Ready to play.";
  const statusDotClass = speechError
    ? "bg-red-500"
    : isSpeaking
      ? "bg-emerald-500"
      : isPaused
        ? "bg-amber-500"
        : "bg-slate-400";
  const accentLabel = accent === "en-GB" ? "British (RP)" : "American (GA)";
  const ipaModeLabel =
    ipaMode === "sentence" ? "Sentence by sentence" : "Full text";

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">
            Practice text
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Type or paste English text, then read its IPA or listen to it in your
            chosen accent.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <label htmlFor="practice-text" className="sr-only">
            English text
          </label>
          <textarea
            id="practice-text"
            value={text}
            onChange={(event) => handleTextChange(event.target.value)}
            rows={7}
            placeholder="Type or paste the English text you want to practice..."
            className="block min-h-[180px] w-full resize-y rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          />

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
                <span className="text-sm font-medium text-slate-900">
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
              <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <Button
                  type="button"
                  onClick={handleStart}
                  disabled={!text.trim()}
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
                  <p className="mt-1 text-xs text-amber-700">
                    {playbackNotice}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Voices are provided by your browser and operating system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showIpa && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                onChange={(value) => setIpaMode(value as IpaMode)}
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

            {ipaStatus === "ready" && ipaMode === "sentence" && (
              ipaPairs.length > 0 ? (
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
              )
            )}

            {ipaStatus === "ready" && ipaMode === "full" && (
              ipa ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="break-words font-mono text-base leading-8 text-indigo-700">
                    {ipa}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No IPA transcription is available for this text.
                </p>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
