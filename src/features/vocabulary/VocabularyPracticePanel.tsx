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
  className?: string;
}

/**
 * One dictionary entry: caption and Listen on the first line, then the English
 * text, its IPA and its Bengali meaning. It owns no box — a nested card would
 * spend two paddings and two borders on decoration and take them straight off
 * the line length a learner has to read.
 */
function PracticeEntry({
  label,
  english,
  bengali,
  entryKey,
  speech,
  className = "",
}: PracticeEntryProps) {
  return (
    <div className={className}>
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

      <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-900 max-w-prose">
        {english}
      </p>
      <InlineIpa text={english} accent={speech.accent} className="max-w-prose" />

      {bengali && (
        <p
          lang="bn"
          className="mt-1.5 break-words text-sm leading-6 text-slate-600 max-w-prose"
        >
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

/** One line of an entry: the text, its IPA and its own Listen button. */
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
              ? "max-w-prose text-sm font-medium leading-6 break-words text-slate-900"
              : "max-w-prose text-sm leading-6 break-words text-slate-700"
          }
        >
          {text}
        </p>
        <InlineIpa text={text} accent={speech.accent} className="max-w-prose" />
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
  singular: string;
  words: VocabularyRelatedWord[];
  speech: ListenSpeech;
}

/**
 * Synonyms and antonyms as a numbered list, not a grid of boxes. Hairlines
 * between entries and a left rule on each example sentence carry the structure
 * that the removed cards used to, at zero horizontal cost.
 */
function RelatedWordSection({
  singular,
  words,
  speech,
}: RelatedWordSectionProps) {
  const lower = singular.toLowerCase();
  const headingId = `vocabulary-${lower}s`;

  return (
    <section aria-labelledby={headingId} className="mt-6 border-t border-slate-200 pt-6">
      <h3
        id={headingId}
        className="text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {`${singular}s`}
      </h3>

      <ul className="mt-4 divide-y divide-slate-200">
        {words.map((word, index) => (
          <li key={word.id} className="py-5 first:pt-0 last:pb-0">
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

            <div className="mt-3 border-l border-slate-200 pl-3">
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
    <div>
      <ListenControls speech={speech} oneRow />

      <div className="mt-6 border-t border-slate-200 pt-6">
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
          className="mt-5 border-t border-slate-200 pt-5"
        />
      </div>

      {vocabulary.synonyms.length > 0 && (
        <RelatedWordSection
          singular="Synonym"
          words={vocabulary.synonyms}
          speech={speech}
        />
      )}

      {vocabulary.antonyms.length > 0 && (
        <RelatedWordSection
          singular="Antonym"
          words={vocabulary.antonyms}
          speech={speech}
        />
      )}
    </div>
  );
}
