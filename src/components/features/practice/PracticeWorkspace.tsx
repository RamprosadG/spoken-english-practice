"use client";

import { useState, useSyncExternalStore } from "react";
import { CopyTextButton } from "@/components/features/practice/CopyTextButton";
import { IpaTranscriptionSection } from "@/components/features/practice/IpaTranscriptionSection";
import { SpeechPracticeControls } from "@/components/features/practice/SpeechPracticeControls";
import { useSpeechPractice } from "@/components/features/practice/useSpeechPractice";

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

export function PracticeWorkspace() {
  const storedText = useSyncExternalStore(
    subscribeToStoredText,
    readStoredText,
    readServerText
  );
  const [editedText, setEditedText] = useState<string | null>(null);
  const text = editedText ?? storedText;
  const practice = useSpeechPractice(text);

  const handleTextChange = (value: string) => {
    setEditedText(value);
    persistText(value);
    practice.handleTextEdited();
  };

  return (
    <section className="flex w-full flex-col">
      {/* The material and the controls are separate blocks, exactly as on the
          presentation practice page: this card holds only the text, so the
          accent, voice, speed and playback row never sits inside it. */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2 bg-slate-100 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Practice Text
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Type or paste English text, then read its IPA or listen to it in
              your chosen accent.
            </p>
          </div>

          <CopyTextButton text={text} subject="Practice Text" />
        </div>

        {/* The field is the card body itself, so it carries no inset of its own:
            it spans the full card width and meets the card frame on all four
            sides. The only chrome left is the house field recipe — the indigo
            hover and focus border — drawn on the field edge inside the card. */}
        <label htmlFor="practice-text" className="sr-only">
          English Text
        </label>
        <textarea
          id="practice-text"
          value={text}
          onChange={(event) => handleTextChange(event.target.value)}
          rows={7}
          placeholder="Type or paste the English text you want to practice..."
          className="block min-h-[180px] w-full resize-y rounded-b-xl border border-transparent bg-white px-5 py-4 text-sm leading-6 text-slate-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-slate-200 focus:border-slate-200 focus:ring-1 focus:ring-inset focus:ring-slate-200"
        />
      </div>

      <div className="mt-6">
        <SpeechPracticeControls practice={practice} />
      </div>

      {practice.showIpa && <IpaTranscriptionSection practice={practice} />}
    </section>
  );
}
