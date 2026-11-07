"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FiCheck, FiX } from "react-icons/fi";
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

// The same secondary recipe the labelled listening Previous/Next row above the
// tabs writes, at one size down: 24 px tall and 12 px type against that row's
// 36 px / 14 px on a wide screen and 28 px / 12 px on a phone. These two step
// one sentence, so they have to read as the local control beside **Listen**
// rather than compete with the library navigation. They are plain buttons
// because `Button` sizes only in three steps, whose smallest is the nav row's
// phone size, and the nav row itself writes the recipe out for the same reason.
// Below `sm` the three share the card width — `flex-1` with a zero basis makes
// them equal thirds and `justify-center` keeps this button's own label centred
// in the space it gained, the same phone recipe the action row at the bottom of
// the form uses for **Check answer** and **Clear all**.
const sentenceStepClass =
  "inline-flex h-6 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg bg-slate-700 px-2.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60 max-sm:flex-1";

interface ListeningDictationWorkspaceProps {
  listeningId: string;
  item: ListeningItem;
  itemNumber: number;
  totalItems: number;
  isActive: boolean;
}

export function ListeningDictationWorkspace({
  listeningId,
  item,
  itemNumber,
  totalItems,
  isActive,
}: ListeningDictationWorkspaceProps) {
  const router = useRouter();
  const speech = useListenSpeech();

  const words = useMemo(() => splitWords(item.text), [item.text]);
  const [answer, setAnswer] = useState("");
  const [check, setCheck] = useState<DictationCheck | null>(null);

  const hasPrevious = itemNumber > 1;
  const hasNext = itemNumber < totalItems;
  const completed = check?.isComplete === true;
  const isBlank = answer.trim().length === 0;

  // The panel stays mounted while the other tab is open, so it has to put its
  // own audio down when it goes off screen.
  const stopRef = useRef(speech.stop);

  useEffect(() => {
    stopRef.current = speech.stop;
  });

  useEffect(() => {
    if (!isActive) {
      stopRef.current();
    }
  }, [isActive]);

  const goToItem = (target: number) => {
    if (target < 1 || target > totalItems || target === itemNumber) {
      return;
    }

    speech.stop();
    router.push(`/listenings/${listeningId}?item=${target}`);
  };

  useEffect(() => {
    if (!completed || !hasNext || !isActive) {
      return;
    }

    const timer = window.setTimeout(() => {
      stopRef.current();
      router.push(`/listenings/${listeningId}?item=${itemNumber + 1}`);
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [completed, hasNext, isActive, itemNumber, listeningId, router]);

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
    <section className="flex w-full flex-col">
      {/* One box holds the whole exercise, and inside it the blocks sit in the
          order the learner works: the explanation, then the accent, voice and
          speed to set, then the sentence's own Previous and Next beside the
          play button, then the answer field. The controls are in the card —
          and above the buttons — so nothing is played before the voice is
          chosen; `Dropdown` portals its menu to the body, so the framed box
          never clips it. */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Dictation</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Play the sentence as many times as you need, write what you hear,
              and fix only the words that went wrong. The text stays hidden
              until your answer matches.
            </p>
          </div>

          <ListenControls speech={speech} oneRow />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToItem(itemNumber - 1)}
              disabled={!hasPrevious}
              aria-label="Previous sentence"
              title="Previous sentence"
              className={sentenceStepClass}
            >
              <FaArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToItem(itemNumber + 1)}
              disabled={!hasNext}
              aria-label="Next sentence"
              title="Next sentence"
              className={sentenceStepClass}
            >
              Next
              <FaArrowRight className="h-4 w-4" />
            </button>
            <PlayTextButton
              isPlaying={speech.speakingKey === "sentence"}
              onClick={() => speech.play("sentence", item.text)}
              ariaLabel="Listen to the sentence"
              label="Listen"
              className="max-sm:flex-1 max-sm:justify-center"
            />
          </div>
        </div>

        <form onSubmit={handleCheck} className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Sentence {itemNumber} of {totalItems}
            <span aria-hidden="true" className="mx-1.5 text-slate-300">
              ·
            </span>
            {words.length} {words.length === 1 ? "word" : "words"}
          </p>

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
            className={`mt-2 w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-base leading-8 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
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
              className="mt-4 border-l-2 border-amber-300 pl-3"
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
              className="mt-4 border-l-2 border-emerald-300 pl-3"
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

          {/* One row at every width, like the other practice pages' action row:
              below `sm` the two share the card's 300 px and take the 12 px /
              28 px phone recipe instead of stacking one per line. Each carries
              the `Button` icon slot on the left — a check for the submit that
              grades the answer, a cross for the one that empties it — the same
              feather set the speech controls' Reset and Repeat use. */}
          <div className="mt-5 flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              icon={<FiCheck className="h-4 w-4" />}
              className="max-sm:flex-1 max-sm:gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
              disabled={isBlank || completed}
            >
              Check answer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              icon={<FiX className="h-4 w-4" />}
              className="max-sm:flex-1 max-sm:gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
              disabled={isBlank && !check}
            >
              Clear all
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
