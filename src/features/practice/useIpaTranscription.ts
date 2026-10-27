"use client";

import { useEffect, useState } from "react";
import type {
  Accent,
  IpaStatus,
} from "@/features/practice/useSpeechPractice";

interface IpaState {
  ipa: string;
  status: IpaStatus;
  error: string | null;
}

function initialState(text: string): IpaState {
  return {
    ipa: "",
    status: text.trim() ? "loading" : "idle",
    error: null,
  };
}

export function useIpaTranscription(text: string, accent: Accent): IpaState {
  const [state, setState] = useState<IpaState>(() => initialState(text));

  useEffect(() => {
    const trimmed = text.trim();
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (!trimmed) {
        setState({ ipa: "", status: "idle", error: null });
        return;
      }

      setState({ ipa: "", status: "loading", error: null });

      try {
        const { phonemize } = await import("phonemize");
        if (cancelled) return;
        setState({
          ipa: phonemize(trimmed, accent),
          status: "ready",
          error: null,
        });
      } catch {
        if (cancelled) return;
        setState({
          ipa: "",
          status: "error",
          error: "IPA is unavailable for this text.",
        });
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, accent]);

  return state;
}
