"use client";

import { InlineIpa } from "@/features/practice/InlineIpa";
import { ListenControls } from "@/features/practice/ListenControls";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import { useListenSpeech } from "@/features/practice/useListenSpeech";
import type { ListenSpeech } from "@/features/practice/useListenSpeech";
import type { VocabularyItem } from "@/types/vocabulary";

interface VocabularyPracticePanelProps {
  vocabulary: VocabularyItem;
}

interface PracticeEntryProps {
  label: string;
  english: string;
  bengali: string | null;
  entryKey: string;
  speech: ListenSpeech;
}

function PracticeEntry({
  label,
  english,
  bengali,
  entryKey,
  speech,
}: PracticeEntryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <PlayTextButton
          isPlaying={speech.speakingKey === entryKey}
          onClick={() => speech.play(entryKey, english)}
          ariaLabel={`Listen to the ${label.toLowerCase()}`}
        />
      </div>

      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
        {english}
      </p>
      <InlineIpa text={english} accent={speech.accent} />

      {bengali && (
        <p lang="bn" className="mt-2 text-sm leading-6 text-slate-600">
          {bengali}
        </p>
      )}
    </div>
  );
}

export function VocabularyPracticePanel({
  vocabulary,
}: VocabularyPracticePanelProps) {
  const speech = useListenSpeech();

  return (
    <div
      id={`vocabulary-practice-${vocabulary.id}`}
      className="border-t border-slate-200 px-4 py-5 sm:px-6 sm:py-6"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-lg font-semibold leading-7 text-slate-900 sm:text-xl">
            {vocabulary.text}
          </p>

          <div className="w-full lg:w-auto lg:min-w-[26rem]">
            <ListenControls speech={speech} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PracticeEntry
            label="Word"
            english={vocabulary.text}
            bengali={vocabulary.meaning}
            entryKey="word"
            speech={speech}
          />

          <PracticeEntry
            label="Example sentence"
            english={vocabulary.sentence}
            bengali={vocabulary.sentenceMeaning}
            entryKey="sentence"
            speech={speech}
          />

          {vocabulary.synonymText && (
            <>
              <PracticeEntry
                label="Synonym"
                english={vocabulary.synonymText}
                bengali={vocabulary.synonymMeaning}
                entryKey="synonym"
                speech={speech}
              />
              {vocabulary.synonymSentence && (
                <PracticeEntry
                  label="Synonym sentence"
                  english={vocabulary.synonymSentence}
                  bengali={vocabulary.synonymSentenceMeaning}
                  entryKey="synonym-sentence"
                  speech={speech}
                />
              )}
            </>
          )}

          {vocabulary.antonymText && (
            <>
              <PracticeEntry
                label="Antonym"
                english={vocabulary.antonymText}
                bengali={vocabulary.antonymMeaning}
                entryKey="antonym"
                speech={speech}
              />
              {vocabulary.antonymSentence && (
                <PracticeEntry
                  label="Antonym sentence"
                  english={vocabulary.antonymSentence}
                  bengali={vocabulary.antonymSentenceMeaning}
                  entryKey="antonym-sentence"
                  speech={speech}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
