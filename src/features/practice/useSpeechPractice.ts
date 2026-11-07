"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildVoiceOptions, findPickedVoice } from "./speechVoices";
import { splitIntoSentences } from "./splitSentences";

export type Accent = "en-GB" | "en-US";
export type Speed = "0.5" | "0.75" | "1" | "1.25" | "1.5";
export type SpeechStatus = "idle" | "speaking" | "paused";
export type IpaStatus = "idle" | "loading" | "ready" | "error";

export interface IpaPair {
  source: string;
  ipa: string;
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
  const [voiceURI, setVoiceURI] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speed, setSpeed] = useState<Speed>("1");
  const [showIpa, setShowIpa] = useState(false);
  const [ipaPairs, setIpaPairs] = useState<IpaPair[]>([]);
  const [ipaStatus, setIpaStatus] = useState<IpaStatus>("idle");
  const [ipaError, setIpaError] = useState<string | null>(null);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>("idle");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<
    number | null
  >(null);
  const [repeat, setRepeat] = useState(false);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // A running utterance keeps the callbacks from the render that started it, so
  // the loop reads the checkbox through a ref and honours a mid-playback change.
  const repeatRef = useRef(repeat);

  const speakableText = text.trim();

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      voicesRef.current = list;
      setVoices(list);
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
      if (!speakableText) {
        if (cancelled) return;
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
        const sentenceTranscriptions: IpaPair[] = splitIntoSentences(
          speakableText,
        ).map((sentence) => ({
          source: sentence,
          ipa: phonemize(sentence, accent),
        }));

        if (!cancelled) {
          setIpaPairs(sentenceTranscriptions);
          setIpaStatus("ready");
        }
      } catch {
        if (!cancelled) {
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
  }, [speakableText, accent, showIpa]);

  const stopSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    activeUtteranceRef.current = null;
    window.speechSynthesis.cancel();
    setSpeechStatus("idle");
    setPlayingSentenceIndex(null);
    setSpeechError(null);
  };

  /** Speaks the whole text (index `null`) or one IPA sentence card. */
  const speakText = (value: string, sentenceIndex: number | null) => {
    const synthesis = window.speechSynthesis;

    // Drop the reference first so the cancelled utterance cannot clear the
    // state this call is about to set.
    activeUtteranceRef.current = null;
    synthesis.cancel();
    setSpeechError(null);
    setPlaybackNotice(null);

    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = accent;
    utterance.rate = Number(speed);

    const voice =
      findPickedVoice(voicesRef.current, voiceURI) ??
      findAccentVoice(voicesRef.current, accent);
    if (voice) {
      utterance.voice = voice;
    } else {
      setPlaybackNotice(
        `No ${ACCENT_LABELS[accent]} voice was found; your browser will use its default English voice.`
      );
    }

    utterance.onend = () => {
      if (activeUtteranceRef.current !== utterance) return;

      // Repeat loops the whole-text playback only; a sentence card stays a
      // one-shot listen. Restarting here instead of in a timer keeps the guard
      // above authoritative: Reset and any new utterance null the ref first.
      if (repeatRef.current && sentenceIndex === null) {
        speakText(value, null);
        return;
      }

      activeUtteranceRef.current = null;
      setPlayingSentenceIndex(null);
      setSpeechStatus("idle");
    };

    utterance.onerror = (event) => {
      if (activeUtteranceRef.current !== utterance) return;

      activeUtteranceRef.current = null;
      setPlayingSentenceIndex(null);
      setSpeechStatus("idle");

      if (event.error !== "interrupted" && event.error !== "canceled") {
        setSpeechError(
          "The browser could not play this text. Please try again."
        );
      }
    };

    activeUtteranceRef.current = utterance;
    setPlayingSentenceIndex(sentenceIndex);
    setSpeechStatus("speaking");
    synthesis.speak(utterance);
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
    // A hand-picked voice belongs to the accent it was listed under.
    setVoiceURI("");
    setPlaybackNotice(null);
    if (showIpa) {
      setIpaStatus("loading");
    }
    if (speechStatus !== "idle") {
      stopSpeech();
    }
  };

  const handleVoiceChange = (value: string) => {
    if (value === voiceURI) return;

    setVoiceURI(value);
    if (speechStatus !== "idle") {
      stopSpeech();
      setPlaybackNotice(
        "Voice changed. Press Start to play the text again with the new voice.",
      );
    } else {
      setPlaybackNotice(null);
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
      setIpaPairs([]);
      setIpaStatus("idle");
      setIpaError(null);
    }
  };

  const handleStart = () => {
    if (!speakableText) {
      setSpeechError("Enter some English text first.");
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Speech playback is not supported in this browser.");
      return;
    }

    if (speechStatus === "paused") {
      window.speechSynthesis.resume();
      setSpeechStatus("speaking");
      return;
    }

    speakText(speakableText, null);
  };

  const handlePlaySentence = (index: number) => {
    const sentence = ipaPairs[index]?.source;
    if (!sentence) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Speech playback is not supported in this browser.");
      return;
    }

    if (playingSentenceIndex === index) {
      stopSpeech();
      return;
    }

    speakText(sentence, index);
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

  /**
   * One control for both directions: it pauses a running utterance and starts
   * or resumes from the pause point otherwise, so playback never jumps back.
   */
  const handleStartPause = () => {
    if (speechStatus === "speaking") {
      handlePause();
      return;
    }

    handleStart();
  };

  const handleRepeatChange = (checked: boolean) => {
    setRepeat(checked);
  };

  const handleReset = () => {
    stopSpeech();
    setPlaybackNotice(null);
  };

  const isSpeaking = speechStatus === "speaking";
  const isPaused = speechStatus === "paused";
  const voiceOptions = useMemo(
    () => buildVoiceOptions(voices, accent),
    [voices, accent],
  );
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

  return {
    accent,
    voice: voiceURI,
    voiceOptions,
    speed,
    showIpa,
    repeat,
    ipaPairs,
    ipaStatus,
    ipaError,
    speechStatus,
    speechError,
    playbackNotice,
    playingSentenceIndex,
    isSpeaking,
    speechLabel,
    statusDotClass,
    hasText: speakableText.length > 0,
    handleTextEdited,
    handleAccentChange,
    handleVoiceChange,
    handleSpeedChange,
    handleShowIpaChange,
    handleRepeatChange,
    handlePlaySentence,
    handleStartPause,
    handleReset,
  };
}

export type SpeechPractice = ReturnType<typeof useSpeechPractice>;
