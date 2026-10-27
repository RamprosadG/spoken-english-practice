"use client";

import { useEffect, useRef, useState } from "react";

export type Accent = "en-GB" | "en-US";
export type Speed = "0.5" | "0.75" | "1" | "1.25" | "1.5";
export type IpaMode = "sentence" | "full";
export type SpeechStatus = "idle" | "speaking" | "paused";
export type IpaStatus = "idle" | "loading" | "ready" | "error";

export interface IpaPair {
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

export const ACCENT_OPTIONS = [
  { value: "en-GB", label: "British English (en-GB)" },
  { value: "en-US", label: "American English (en-US)" },
];

export const SPEED_OPTIONS = [
  { value: "0.5", label: "0.5× (Slow)" },
  { value: "0.75", label: "0.75×" },
  { value: "1", label: "1× (Normal)" },
  { value: "1.25", label: "1.25×" },
  { value: "1.5", label: "1.5× (Fast)" },
];

export const IPA_MODE_OPTIONS = [
  { value: "sentence", label: "Sentence by sentence" },
  { value: "full", label: "Full translation" },
];

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
      (voice) =>
        voice.lang.replace("_", "-").toLowerCase() === accent.toLowerCase()
    ) ?? null
  );
}

export function useSpeechPractice(text: string) {
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
          setIpaError(
            "Could not generate the IPA transcription. Please try again."
          );
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

  const handleTextEdited = () => {
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
        setSpeechError(
          "The browser could not play this text. Please try again."
        );
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

  return {
    accent,
    speed,
    showIpa,
    ipaMode,
    ipa,
    ipaPairs,
    ipaStatus,
    ipaError,
    speechStatus,
    speechError,
    playbackNotice,
    isSpeaking,
    isPaused,
    speechLabel,
    statusDotClass,
    accentLabel,
    ipaModeLabel,
    hasText: text.trim().length > 0,
    handleTextEdited,
    handleAccentChange,
    handleSpeedChange,
    handleShowIpaChange,
    handleIpaModeChange: (value: string) => setIpaMode(value as IpaMode),
    handleStart,
    handlePause,
    handleReset,
  };
}

export type SpeechPractice = ReturnType<typeof useSpeechPractice>;
