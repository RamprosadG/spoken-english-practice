"use client";

import type { Accent } from "@/features/practice/useSpeechPractice";
import { useIpaTranscription } from "@/features/practice/useIpaTranscription";

interface InlineIpaProps {
  text: string;
  accent: Accent;
  className?: string;
}

export function InlineIpa({ text, accent, className = "" }: InlineIpaProps) {
  const { ipa, status } = useIpaTranscription(text, accent);

  if (!text.trim()) return null;

  return (
    <p
      className={`mt-1 break-words font-mono text-[13px] leading-6 text-indigo-700 ${className}`}
    >
      {status === "loading" && (
        <span className="font-sans text-xs text-slate-400">Transcribing…</span>
      )}
      {status === "error" && (
        <span className="font-sans text-xs font-medium text-amber-700">
          IPA unavailable
        </span>
      )}
      {status === "ready" && (ipa || "—")}
    </p>
  );
}
