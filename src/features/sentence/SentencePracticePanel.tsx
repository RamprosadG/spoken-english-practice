"use client";

import { InlineIpa } from "@/features/practice/InlineIpa";
import { ListenControls } from "@/features/practice/ListenControls";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import { useListenSpeech } from "@/features/practice/useListenSpeech";
import type { SentenceItem } from "@/types/sentence";

interface SentencePracticePanelProps {
  sentence: SentenceItem;
}

/**
 * The sentence, its IPA and its Bengali meaning as one dictionary entry: the
 * caption and the Listen button share the first line, the material sits under
 * it. No box — a card around the entry spends two paddings and two borders on
 * decoration and takes them straight off the line a learner has to read.
 */
export function SentencePracticePanel({
  sentence,
}: SentencePracticePanelProps) {
  const speech = useListenSpeech();

  return (
    <div>
      <ListenControls speech={speech} oneRow />

      <div className="mt-6 border-t border-slate-200 pt-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Sentence
          </p>
          <PlayTextButton
            isPlaying={speech.speakingKey === "sentence"}
            onClick={() => speech.play("sentence", sentence.text)}
            ariaLabel="Listen To The Sentence"
          />
        </div>

        <p className="mt-2 max-w-prose break-words text-sm font-medium leading-6 text-slate-900">
          {sentence.text}
        </p>
        <InlineIpa text={sentence.text} accent={speech.accent} className="max-w-prose" />

        <p
          lang="bn"
          className="mt-1.5 max-w-prose break-words text-sm leading-6 text-slate-600"
        >
          {sentence.meaning}
        </p>

        {sentence.whenToUse && (
          <p className="mt-4 max-w-prose border-l-2 border-amber-300 pl-3 text-sm leading-6 text-amber-800">
            <span className="font-semibold text-amber-900">When To Use:</span>{" "}
            {sentence.whenToUse}
          </p>
        )}
      </div>

      {sentence.alternates.length > 0 && (
        <section
          aria-labelledby="sentence-alternates"
          className="mt-6 border-t border-slate-200 pt-6"
        >
          <h3
            id="sentence-alternates"
            className="text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            Alternate Expressions
          </h3>

          {/* Hairlines between entries carry the separation the removed slab
              and its nested rows used to, at zero horizontal cost. */}
          <ul className="mt-4 divide-y divide-slate-200">
            {sentence.alternates.map((alternate) => (
              <li key={alternate.id} className="py-5 first:pt-0 last:pb-0">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {`Expression ${alternate.sequence}`}
                </p>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="max-w-prose break-words text-sm font-medium leading-6 text-slate-900">
                      {alternate.text}
                    </p>
                    <InlineIpa
                      text={alternate.text}
                      accent={speech.accent}
                      className="max-w-prose"
                    />
                  </div>

                  <PlayTextButton
                    isPlaying={
                      speech.speakingKey === `alternate-${alternate.id}`
                    }
                    onClick={() =>
                      speech.play(`alternate-${alternate.id}`, alternate.text)
                    }
                    ariaLabel={`Listen To Alternate Expression ${alternate.sequence}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
