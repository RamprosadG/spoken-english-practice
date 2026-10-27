"use client";

import { useState, useSyncExternalStore } from "react";
import { IpaTranscriptionCard } from "@/features/practice/IpaTranscriptionCard";
import { SpeechPracticeControls } from "@/features/practice/SpeechPracticeControls";
import { useSpeechPractice } from "@/features/practice/useSpeechPractice";

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
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
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

          <SpeechPracticeControls practice={practice} />
        </div>
      </div>

      {practice.showIpa && <IpaTranscriptionCard practice={practice} />}
    </section>
  );
}
