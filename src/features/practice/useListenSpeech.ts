"use client";

import { useEffect, useRef, useState } from "react";
import type { Accent, Speed } from "@/features/practice/useSpeechPractice";

const ACCENT_LABELS: Record<Accent, string> = {
  "en-GB": "British English",
  "en-US": "American English",
};

function findAccentVoice(
  voices: SpeechSynthesisVoice[],
  accent: Accent,
): SpeechSynthesisVoice | null {
  return (
    voices.find(
      (voice) =>
        voice.lang.replace("_", "-").toLowerCase() === accent.toLowerCase(),
    ) ?? null
  );
}

/**
 * Listen-only playback for short saved content. There is deliberately no
 * pause or reset: each item has its own play action, and starting another
 * item cancels the current one.
 */
export function useListenSpeech() {
  const [accent, setAccent] = useState<Accent>("en-GB");
  const [speed, setSpeed] = useState<Speed>("1");
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
      activeUtteranceRef.current = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    activeUtteranceRef.current = null;
    window.speechSynthesis.cancel();
    setSpeakingKey(null);
  };

  const play = (key: string, text: string) => {
    if (!text.trim()) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Speech playback is not supported in this browser.");
      return;
    }

    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    setError(null);
    setNotice(null);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = Number(speed);

    const voice = findAccentVoice(voicesRef.current, accent);
    if (voice) {
      utterance.voice = voice;
    } else {
      setNotice(
        `No ${ACCENT_LABELS[accent]} voice was found; your browser will use its default English voice.`,
      );
    }

    utterance.onend = () => {
      if (activeUtteranceRef.current === utterance) {
        activeUtteranceRef.current = null;
        setSpeakingKey(null);
      }
    };

    utterance.onerror = (event) => {
      if (activeUtteranceRef.current !== utterance) return;

      activeUtteranceRef.current = null;
      setSpeakingKey(null);

      if (event.error !== "interrupted" && event.error !== "canceled") {
        setError("The browser could not play this text. Please try again.");
      }
    };

    activeUtteranceRef.current = utterance;
    setSpeakingKey(key);
    synthesis.speak(utterance);
  };

  const handleAccentChange = (value: string) => {
    if (value === accent) return;

    setAccent(value as Accent);
    setError(null);
    setNotice(null);

    if (activeUtteranceRef.current) {
      stop();
      setNotice(
        `Accent changed to ${ACCENT_LABELS[value as Accent]}. Tap Listen to play again.`,
      );
    }
  };

  const handleSpeedChange = (value: string) => {
    if (value === speed) return;

    setSpeed(value as Speed);
    setError(null);
    setNotice(null);

    if (activeUtteranceRef.current) {
      stop();
      setNotice(
        `Speed changed to ${value}×. Tap Listen to play again.`,
      );
    }
  };

  return {
    accent,
    speed,
    speakingKey,
    error,
    notice,
    play,
    handleAccentChange,
    handleSpeedChange,
  };
}

export type ListenSpeech = ReturnType<typeof useListenSpeech>;
