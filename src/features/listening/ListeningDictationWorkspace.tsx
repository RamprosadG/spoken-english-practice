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
  type DictationCheck,
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
  const [answer, setAnswer] = useState("");
  const [check, setCheck] = useState<DictationCheck | null>(null);

  const hasNext = itemNumber < totalItems;
  const completed = check?.isComplete === true;
  const isBlank = answer.trim().length === 0;

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
    setCheck(checkDictation(words, splitWords(answer)));
  };

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    // A stale verdict must not outlive the edit it described.
    setCheck(null);
  };

  const handleClear = () => {
    setAnswer("");
    setCheck(null);
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
              what you type matches what you heard.
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
                  Play the audio as many times as you need, then write the whole
                  sentence below. A wrong answer is pointed out word by word, so
                  only the words you missed are revealed.
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
            This sentence has {words.length}{" "}
            {words.length === 1 ? "word" : "words"}.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <textarea
            id="listening-dictation-answer"
            rows={3}
            value={answer}
            onChange={(event) => handleAnswerChange(event.target.value)}
            aria-label="Type the sentence you heard"
            aria-invalid={check && !completed ? true : undefined}
            placeholder="Write the sentence you hear…"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-base leading-8 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
              completed
                ? "border-emerald-500 text-emerald-800"
                : check
                  ? "border-red-500 text-slate-900"
                  : "border-gray-300 text-slate-900"
            }`}
          />

          {check && !completed && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                Fix these words
              </p>
              {check.typedCount !== words.length && (
                <p className="mt-1 text-sm text-amber-800">
                  This sentence has {words.length}{" "}
                  {words.length === 1 ? "word" : "words"}, you wrote{" "}
                  {check.typedCount}.
                </p>
              )}
              {check.wrongIndexes.length > 0 && (
                <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-800">
                  {check.wrongIndexes.map((index) => (
                    <li key={index}>
                      Word {index + 1}:{" "}
                      <span className="font-semibold">{words[index]}</span>
                    </li>
                  ))}
                </ul>
              )}
              {check.extraWords.length > 0 && (
                <p className="mt-1 text-sm text-amber-800">
                  Extra words after the sentence:{" "}
                  <span className="font-semibold">
                    {check.extraWords.join(" ")}
                  </span>
                </p>
              )}
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
              disabled={isBlank || completed}
            >
              Check answer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              className="w-full sm:w-auto"
              disabled={isBlank && !check}
            >
              Clear all
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
