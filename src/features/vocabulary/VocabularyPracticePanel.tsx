"use client";

import { InlineIpa } from "@/features/practice/InlineIpa";
import { ListenControls } from "@/features/practice/ListenControls";
import { PlayTextButton } from "@/features/practice/PlayTextButton";
import { useListenSpeech } from "@/features/practice/useListenSpeech";
import type { ListenSpeech } from "@/features/practice/useListenSpeech";
import type { VocabularyItem, VocabularyRelatedWord } from "@/types/vocabulary";

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

interface RelatedWordEntryProps {
  text: string;
  entryKey: string;
  ariaLabel: string;
  tone: "strong" | "plain";
  speech: ListenSpeech;
}

/**
 * One line of a synonym or antonym subsection: the text, its IPA and its own
 * Listen button — the same row shape an alternate expression uses.
 */
function RelatedWordEntry({
  text,
  entryKey,
  ariaLabel,
  tone,
  speech,
}: RelatedWordEntryProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p
          className={
            tone === "strong"
              ? "text-sm font-medium leading-6 break-words text-slate-900"
              : "text-sm leading-6 break-words text-slate-700"
          }
        >
          {text}
        </p>
        <InlineIpa text={text} accent={speech.accent} />
      </div>
      <PlayTextButton
        isPlaying={speech.speakingKey === entryKey}
        onClick={() => speech.play(entryKey, text)}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

interface RelatedWordSectionProps {
  vocabularyId: string;
  singular: string;
  words: VocabularyRelatedWord[];
  speech: ListenSpeech;
}

function RelatedWordSection({
  vocabularyId,
  singular,
  words,
  speech,
}: RelatedWordSectionProps) {
  const lower = singular.toLowerCase();
  const headingId = `vocabulary-${lower}s-${vocabularyId}`;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4"
    >
      <h3
        id={headingId}
        className="text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {`${singular}s`}
      </h3>

      <ul className="mt-3 flex flex-col gap-3">
        {words.map((word, index) => (
          <li
            key={word.id}
            className="rounded-lg border border-slate-200 bg-white p-3.5"
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {`${lower} ${index + 1}`}
            </p>

            <RelatedWordEntry
              text={word.word}
              entryKey={`${lower}-${word.id}-word`}
              ariaLabel={`Listen to the ${lower} ${index + 1}`}
              tone="strong"
              speech={speech}
            />

            <div className="mt-3 border-t border-slate-100 pt-3">
              <RelatedWordEntry
                text={word.sentence}
                entryKey={`${lower}-${word.id}-sentence`}
                ariaLabel={`Listen to the ${lower} ${index + 1} example sentence`}
                tone="plain"
                speech={speech}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
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
        <p className="break-words text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          {vocabulary.text}
        </p>

        <ListenControls speech={speech} oneRow className="mt-4" />

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
        </div>

        {(vocabulary.synonyms.length > 0 || vocabulary.antonyms.length > 0) && (
          <div className="mt-4 flex flex-col gap-4">
            {vocabulary.synonyms.length > 0 && (
              <RelatedWordSection
                vocabularyId={vocabulary.id}
                singular="Synonym"
                words={vocabulary.synonyms}
                speech={speech}
              />
            )}

            {vocabulary.antonyms.length > 0 && (
              <RelatedWordSection
                vocabularyId={vocabulary.id}
                singular="Antonym"
                words={vocabulary.antonyms}
                speech={speech}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
