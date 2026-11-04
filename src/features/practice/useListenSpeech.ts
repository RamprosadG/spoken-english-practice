"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildVoiceOptions, findPickedVoice } from "./speechVoices";
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
  const [voiceURI, setVoiceURI] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speed, setSpeed] = useState<Speed>("1");
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const voiceOptions = useMemo(
    () => buildVoiceOptions(voices, accent),
    [voices, accent],
  );

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

    const voice =
      findPickedVoice(voicesRef.current, voiceURI) ??
      findAccentVoice(voicesRef.current, accent);
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
    // A hand-picked voice belongs to the accent it was listed under.
    setVoiceURI("");
    setError(null);
    setNotice(null);

    if (activeUtteranceRef.current) {
      stop();
      setNotice(
        `Accent changed to ${ACCENT_LABELS[value as Accent]}. Tap Listen to play again.`,
      );
    }
  };

  const handleVoiceChange = (value: string) => {
    if (value === voiceURI) return;

    setVoiceURI(value);
    setError(null);
    setNotice(null);

    if (activeUtteranceRef.current) {
      stop();
      setNotice("Voice changed. Tap Listen to play again.");
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
    voice: voiceURI,
    voiceOptions,
    speed,
    speakingKey,
    error,
    notice,
    play,
    handleAccentChange,
    handleVoiceChange,
    handleSpeedChange,
  };
}

export type ListenSpeech = ReturnType<typeof useListenSpeech>;
