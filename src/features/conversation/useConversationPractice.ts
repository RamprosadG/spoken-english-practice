"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ACCENT_OPTIONS,
  SPEED_OPTIONS,
  type Accent,
  type Speed,
  type SpeechStatus,
} from "@/features/practice/useSpeechPractice";
import {
  buildVoiceOptions,
  guessVoiceGender,
  voicesForAccent,
} from "@/features/practice/speechVoices";
import type { ConversationLineItem, ConversationSpeaker } from "@/types/conversation";

export type { Accent, Speed };
export { ACCENT_OPTIONS, SPEED_OPTIONS };

const ACCENT_LABELS: Record<Accent, string> = {
  "en-GB": "British English",
  "en-US": "American English",
};

/** Both speakers share one accent, so this is what keeps them apart by default. */
const PREFERRED_GENDER: Record<ConversationSpeaker, "female" | "male"> = {
  one: "female",
  two: "male",
};

function resolveVoice(
  speaker: ConversationSpeaker,
  accent: Accent,
  voices: SpeechSynthesisVoice[],
  pickedVoiceURI: string,
): SpeechSynthesisVoice | null {
  if (pickedVoiceURI) {
    const picked = voices.find((voice) => voice.voiceURI === pickedVoiceURI);
    if (picked) return picked;
  }

  const candidates = voicesForAccent(voices, accent);

  return (
    candidates.find(
      (voice) => guessVoiceGender(voice) === PREFERRED_GENDER[speaker],
    ) ?? candidates[0] ?? null
  );
}

export interface ConversationTurn {
  key: string;
  text: string;
  speaker: ConversationSpeaker;
  speakerName: string;
  index: number;
}

interface ConversationSource {
  speaker1: string;
  speaker2: string;
  lines: ConversationLineItem[];
}

/**
 * Two-voice conversation playback. One utterance per turn is chained from the
 * previous `onend`, so the two speakers alternate without overlapping, and no
 * utterance ever contains a speaker name.
 */
export function useConversationPractice({
  speaker1,
  speaker2,
  lines,
}: ConversationSource) {
  const turns = useMemo<ConversationTurn[]>(
    () =>
      lines.map((line, index) => ({
        key: line.id,
        text: line.text,
        speaker: line.speaker,
        speakerName: line.speaker === "one" ? speaker1 : speaker2,
        index,
      })),
    [lines, speaker1, speaker2],
  );

  const [accent, setAccent] = useState<Accent>("en-GB");
  const [pickedVoices, setPickedVoices] = useState<
    Record<ConversationSpeaker, string>
  >({ one: "", two: "" });
  const [speed, setSpeed] = useState<Speed>("1");
  const [showIpa, setShowIpa] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>("idle");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);
  const [playingTurnIndex, setPlayingTurnIndex] = useState<number | null>(null);

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // A running chain captures the callbacks from the render that started it, so
  // every value read mid-playback comes from a ref instead.
  const turnsRef = useRef(turns);
  const accentRef = useRef(accent);
  const pickedVoicesRef = useRef(pickedVoices);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speedRef = useRef(speed);
  const repeatRef = useRef(repeat);
  const statusRef = useRef<SpeechStatus>("idle");
  // The turn the chain stopped on, so a pause at a turn boundary resumes there
  // instead of rewinding.
  const nextTurnRef = useRef(0);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);

  useEffect(() => {
    pickedVoicesRef.current = pickedVoices;
  }, [pickedVoices]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

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
      voicesRef.current = [];
      activeUtteranceRef.current = null;
      statusRef.current = "idle";
      window.speechSynthesis.cancel();
    };
  }, []);

  const applyStatus = (next: SpeechStatus) => {
    statusRef.current = next;
    setSpeechStatus(next);
  };

  const stopSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    // Drop the reference first so the cancelled utterance cannot clear the
    // state this call is about to set.
    activeUtteranceRef.current = null;
    nextTurnRef.current = 0;
    window.speechSynthesis.cancel();
    applyStatus("idle");
    setPlayingTurnIndex(null);
    setSpeechError(null);
  };

  const finish = () => {
    activeUtteranceRef.current = null;
    nextTurnRef.current = 0;
    setPlayingTurnIndex(null);
    applyStatus("idle");
  };

  /** Speaks one turn, then the rest of the conversation when `chained`. */
  const speakTurn = (index: number, chained: boolean) => {
    const synthesis = window.speechSynthesis;
    const turn = turnsRef.current[index];

    if (!turn) {
      finish();
      return;
    }

    const voice = resolveVoice(
      turn.speaker,
      accentRef.current,
      voicesRef.current,
      pickedVoicesRef.current[turn.speaker],
    );

    activeUtteranceRef.current = null;
    synthesis.cancel();
    setSpeechError(null);
    setPlaybackNotice(null);

    // Only the spoken words reach the utterance; the name stays a label.
    const utterance = new SpeechSynthesisUtterance(turn.text);
    utterance.lang = accentRef.current;
    utterance.rate = Number(speedRef.current);

    if (voice) {
      utterance.voice = voice;
    } else {
      setPlaybackNotice(
        `No ${ACCENT_LABELS[accentRef.current]} voice was found; your browser will use its default English voice.`,
      );
    }

    utterance.onend = () => {
      if (activeUtteranceRef.current !== utterance) return;

      const following = index + 1;

      // Paused while this turn was ending: remember where the chain stopped
      // and let Start continue from there.
      if (statusRef.current === "paused") {
        nextTurnRef.current = following;
        return;
      }

      if (chained && following < turnsRef.current.length) {
        nextTurnRef.current = following;
        speakTurn(following, true);
        return;
      }

      // Repeat loops the whole conversation only; a single turn stays a
      // one-shot listen. Restarting from onend rather than a timer keeps the
      // guard above authoritative.
      if (chained && repeatRef.current) {
        nextTurnRef.current = 0;
        speakTurn(0, true);
        return;
      }

      finish();
    };

    utterance.onerror = (event) => {
      if (activeUtteranceRef.current !== utterance) return;

      finish();

      if (event.error !== "interrupted" && event.error !== "canceled") {
        setSpeechError(
          "The browser could not play this conversation. Please try again.",
        );
      }
    };

    activeUtteranceRef.current = utterance;
    setPlayingTurnIndex(index);
    applyStatus("speaking");
    synthesis.speak(utterance);
  };

  const handleStart = () => {
    if (turnsRef.current.length === 0) {
      setSpeechError("This conversation has no turns yet.");
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Speech playback is not supported in this browser.");
      return;
    }

    if (speechStatus === "paused") {
      // Either the engine still holds a paused utterance, or the chain stopped
      // at a turn boundary.
      if (window.speechSynthesis.paused && activeUtteranceRef.current) {
        window.speechSynthesis.resume();
        applyStatus("speaking");
        return;
      }

      speakTurn(nextTurnRef.current, true);
      return;
    }

    nextTurnRef.current = 0;
    speakTurn(0, true);
  };

  const handlePause = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (speechStatus === "speaking") {
      window.speechSynthesis.pause();
      applyStatus("paused");
    }
  };

  /**
   * One control for both directions: it pauses a running conversation and
   * starts or resumes from the pause point otherwise.
   */
  const handleStartPause = () => {
    if (speechStatus === "speaking") {
      handlePause();
      return;
    }

    handleStart();
  };

  const handlePlayTurn = (index: number) => {
    if (playingTurnIndex === index && speechStatus !== "idle") {
      stopSpeech();
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechError("Speech playback is not supported in this browser.");
      return;
    }

    speakTurn(index, false);
  };

  const announceSettingChange = (message: string) => {
    setPlaybackNotice(message);
    if (statusRef.current !== "idle") {
      stopSpeech();
    }
  };

  const handleAccentChange = (value: string) => {
    const next = value as Accent;
    if (accentRef.current === next) return;

    setAccent(next);
    // Hand-picked voices belong to the accent they were listed under.
    setPickedVoices({ one: "", two: "" });
    announceSettingChange(
      `${ACCENT_LABELS[next]} selected for both speakers. Press Start to play again.`,
    );
  };

  const handleVoiceChange = (speaker: ConversationSpeaker, value: string) => {
    if (pickedVoicesRef.current[speaker] === value) return;

    setPickedVoices((current) => ({ ...current, [speaker]: value }));
    announceSettingChange("Voice changed. Press Start to play again.");
  };

  const handleSpeedChange = (value: string) => {
    const next = value as Speed;
    if (speedRef.current === next) return;

    setSpeed(next);
    announceSettingChange(
      `Speed changed to ${value}×. Press Start to play again at the new speed.`,
    );
  };

  const handleShowIpaChange = (checked: boolean) => {
    setShowIpa(checked);
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
  const hasTurns = turns.length > 0;
  const voiceOptions = useMemo(
    () => buildVoiceOptions(voices, accent),
    [voices, accent],
  );
  const speechLabel = speechError
    ? speechError
    : isSpeaking
      ? `Turn ${(playingTurnIndex ?? 0) + 1} of ${turns.length} · ${ACCENT_LABELS[accent]} at ${speed}×.`
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
    turns,
    accent,
    pickedVoices,
    voices,
    speed,
    showIpa,
    repeat,
    speechStatus,
    speechError,
    playbackNotice,
    playingTurnIndex,
    isSpeaking,
    isPaused,
    hasTurns,
    speechLabel,
    statusDotClass,
    voiceOptions,
    handleAccentChange,
    handleVoiceChange,
    handleSpeedChange,
    handleShowIpaChange,
    handleRepeatChange,
    handlePlayTurn,
    handleStartPause,
    handleReset,
  };
}

export type ConversationPractice = ReturnType<typeof useConversationPractice>;
