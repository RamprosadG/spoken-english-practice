"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/buttons/Button";
import { ListenControls } from "@/features/practice/ListenControls";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import { useListenSpeech } from "@/features/practice/useListenSpeech";
import {
  checkDictation,
  splitWords,
} from "@/features/listening/listeningDictation";
import type { ListeningItem } from "@/types/listening";

const AUTO_ADVANCE_MS = 1800;

interface ListeningDictationWorkspaceProps {
  listeningId: string;
  item: ListeningItem;
  itemNumber: number;
  totalItems: number;
}

export function ListeningDictationWorkspace({
  listeningId,
  item,
  itemNumber,
  totalItems,
}: ListeningDictationWorkspaceProps) {
  const router = useRouter();
  const speech = useListenSpeech();

  const words = useMemo(() => splitWords(item.text), [item.text]);
  const [answers, setAnswers] = useState<string[]>(() => words.map(() => ""));
  // null means "not checked yet", so a stale colour can never outlive an edit.
  const [slots, setSlots] = useState<(boolean | null)[]>(() =>
    words.map(() => null),
  );
  const [completed, setCompleted] = useState(false);

  const hasNext = itemNumber < totalItems;
  const wrongIndexes = slots.reduce<number[]>(
    (indexes, correct, index) => {
      if (correct === false) indexes.push(index);
      return indexes;
    },
    [],
  );

  useEffect(() => {
    if (!completed || !hasNext) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.push(`/listenings/${listeningId}?item=${itemNumber + 1}`);
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [completed, hasNext, itemNumber, listeningId, router]);

  const handleCheck = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = checkDictation(words, answers);
    setSlots(result.slots);
    setCompleted(result.isComplete);
  };

  const handleWordChange = (index: number, value: string) => {
    setAnswers((previous) =>
      previous.map((word, position) => (position === index ? value : word)),
    );
    setSlots((previous) =>
      previous.map((state, position) => (position === index ? null : state)),
    );
    setCompleted(false);
  };

  const handleClear = () => {
    setAnswers(words.map(() => ""));
    setSlots(words.map(() => null));
    setCompleted(false);
  };

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Listen to the sentence
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Sentence {itemNumber} of {totalItems}. The text stays hidden until
              every word you type matches what you heard.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  How to practice
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Play the audio as many times as you need, then write one word
                  in each box. A wrong box gets a hint for that word alone, never
                  the whole sentence.
                </p>
              </div>
            </div>

            <div className="w-full shrink-0 lg:w-72">
              <ListenControls speech={speech} stacked />
              <PlayTextButton
                isPlaying={speech.speakingKey === "sentence"}
                onClick={() => speech.play("sentence", item.text)}
                ariaLabel="Listen to the sentence"
                label="Listen"
                className="mt-3 w-full justify-center"
              />
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCheck}
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">
            Type what you heard
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {words.length} {words.length === 1 ? "word" : "words"} in this
            sentence.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <ul className="flex flex-wrap items-center gap-2.5">
            {words.map((word, index) => (
              <li key={index} className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium tabular-nums text-slate-400">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={answers[index] ?? ""}
                  onChange={(event) =>
                    handleWordChange(index, event.target.value)
                  }
                  aria-label={`Word ${index + 1} of ${words.length}`}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  style={{ width: `${Math.max(4, word.length + 1)}ch` }}
                  className={`rounded-lg border px-2.5 py-1.5 text-sm shadow-xs outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                    slots[index] === true
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : slots[index] === false
                        ? "border-red-500 bg-red-50 text-red-800"
                        : "border-gray-300 bg-white text-slate-900"
                  }`}
                />
              </li>
            ))}
          </ul>

          {wrongIndexes.length > 0 && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                Fix these words
              </p>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-800">
                {wrongIndexes.map((index) => (
                  <li key={index}>
                    Word {index + 1}:{" "}
                    <span className="font-semibold">{words[index]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {completed && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3"
            >
              <p className="text-sm font-semibold text-emerald-800">
                Correct — that matches the audio.
              </p>
              <p className="mt-1 break-words text-sm leading-7 text-emerald-900">
                {item.text}
              </p>
              <p className="mt-1.5 text-xs font-medium text-emerald-800">
                {hasNext
                  ? `Moving to sentence ${itemNumber + 1}…`
                  : "You finished every sentence in this listening."}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              disabled={completed}
            >
              Check answer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              className="w-full sm:w-auto"
            >
              Clear all
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
