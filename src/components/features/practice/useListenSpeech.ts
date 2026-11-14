"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildVoiceOptions, findPickedVoice } from "./speechVoices";
import type { Accent, Speed } from "@/components/features/practice/useSpeechPractice";

export type ListenStep = string | { audioUrl: string };

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

// Listen-only playback: each item starts a fresh sequence and cancels the previous one.
export function useListenSpeech() {
  const [accent, setAccent] = useState<Accent>("en-GB");
  const [voiceURI, setVoiceURI] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speed, setSpeed] = useState<Speed>("1");
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeStepRef = useRef<object | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voiceOptions = useMemo(
    () => buildVoiceOptions(voices, accent),
    [voices, accent],
  );

  useEffect(() => {
    const speechSupported =
      typeof window !== "undefined" && "speechSynthesis" in window;

    const loadVoices = () => {
      if (!speechSupported) return;
      const list = window.speechSynthesis.getVoices();
      voicesRef.current = list;
      setVoices(list);
    };

    loadVoices();
    if (speechSupported) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    }

    return () => {
      if (speechSupported) {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      }
      activeStepRef.current = null;
      const audio = audioRef.current;
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      }
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
      setSpeakingKey(null);
      setSpeakingIndex(null);
    };
  }, []);

  const stop = () => {
    activeStepRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingKey(null);
    setSpeakingIndex(null);
  };

  const playSequence = (key: string, steps: readonly ListenStep[]) => {
    if (steps.length === 0 || typeof window === "undefined") return;

    const synthesis =
      "speechSynthesis" in window ? window.speechSynthesis : null;
    const hasText = steps.some((step) => typeof step === "string");
    const hasAudio = steps.some((step) => typeof step !== "string");

    if (hasText && !synthesis) {
      setError("Speech playback is not supported in this browser.");
      return;
    }
    if (hasAudio && typeof window.Audio === "undefined") {
      setError("Audio playback is not supported in this browser.");
      return;
    }

    stop();
    setError(null);
    setNotice(null);

    const voice = hasText
      ? findPickedVoice(voicesRef.current, voiceURI) ??
        findAccentVoice(voicesRef.current, accent)
      : null;
    if (hasText && !voice) {
      setNotice(
        `No ${ACCENT_LABELS[accent]} voice was found; your browser will use its default English voice.`,
      );
    }

    const rate = Number(speed);
    const audio = hasAudio ? new Audio() : null;
    audioRef.current = audio;

    const playNext = (index: number) => {
      const step = steps[index];
      const token = {};
      activeStepRef.current = token;
      setSpeakingKey(key);
      setSpeakingIndex(index);

      const finish = () => {
        if (activeStepRef.current !== token) return;
        if (index + 1 < steps.length) {
          playNext(index + 1);
        } else {
          activeStepRef.current = null;
          setSpeakingKey(null);
          setSpeakingIndex(null);
        }
      };

      const fail = (message?: string) => {
        if (activeStepRef.current !== token) return;
        stop();
        if (message) setError(message);
      };

      if (typeof step === "string") {
        if (!synthesis) {
          fail("Speech playback is not supported in this browser.");
          return;
        }
        const utterance = new SpeechSynthesisUtterance(step);
        utterance.lang = accent;
        utterance.rate = rate;
        if (voice) utterance.voice = voice;
        utterance.onend = finish;
        utterance.onerror = (event) => {
          if (event.error === "interrupted" || event.error === "canceled") {
            fail();
          } else {
            fail("The browser could not play this text. Please try again.");
          }
        };
        synthesis.speak(utterance);
        return;
      }

      if (!audio) {
        fail("Audio playback is not supported in this browser.");
        return;
      }
      audio.onended = finish;
      audio.onerror = () =>
        fail("This sound recording could not be played. Please try again.");
      audio.src = step.audioUrl;
      audio.playbackRate = rate;
      audio.preservesPitch = true;
      audio.load();
      void audio.play().catch(() =>
        fail("This sound recording could not be played. Please try again."),
      );
    };

    playNext(0);
  };

  const play = (key: string, text: string) => {
    if (text.trim()) playSequence(key, [text]);
  };

  const handleAccentChange = (value: string) => {
    if (value === accent) return;

    setAccent(value as Accent);
    // A hand-picked voice belongs to the accent it was listed under.
    setVoiceURI("");
    setError(null);
    setNotice(null);

    if (activeStepRef.current) {
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

    if (activeStepRef.current) {
      stop();
      setNotice("Voice changed. Tap Listen to play again.");
    }
  };

  const handleSpeedChange = (value: string) => {
    if (value === speed) return;

    setSpeed(value as Speed);
    setError(null);
    setNotice(null);

    if (activeStepRef.current) {
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
    speakingIndex,
    error,
    notice,
    play,
    playSequence,
    // Callers that take the panel off screen use this to put their own audio
    // down; there is deliberately no pause control for the learner.
    stop,
    handleAccentChange,
    handleVoiceChange,
    handleSpeedChange,
  };
}

export type ListenSpeech = ReturnType<typeof useListenSpeech>;
