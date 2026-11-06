"use client";

import { FiPlus, FiTrash2 } from "react-icons/fi";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";

const WORD_MAX_LENGTH = 100;
const SENTENCE_MAX_LENGTH = 1000;
const MAX_RELATED_WORDS = 20;

export interface VocabularyRelatedWordDraft {
  key: string;
  word: string;
  sentence: string;
}

export interface VocabularyRelatedWordErrors {
  word?: string;
  sentence?: string;
}

let relatedWordKeyCounter = 0;

/**
 * Keys anchor React state only. They never travel to the API, where the array
 * order alone defines the stored synonym or antonym sequence.
 */
export function createRelatedWordKey() {
  relatedWordKeyCounter += 1;
  return `related-${relatedWordKeyCounter}`;
}

interface VocabularyRelatedWordListProps {
  /** "Synonym" or "Antonym" — the rest of the copy is built from it. */
  singular: string;
  hint: string;
  words: VocabularyRelatedWordDraft[];
  errors: Record<string, VocabularyRelatedWordErrors>;
  onChange: (words: VocabularyRelatedWordDraft[]) => void;
}

export function VocabularyRelatedWordList({
  singular,
  hint,
  words,
  errors,
  onChange,
}: VocabularyRelatedWordListProps) {
  const lower = singular.toLowerCase();
  const wordLabel = `${singular} word`;
  const sentenceLabel = `${singular} sentence`;

  const handleChange = (
    key: string,
    field: keyof Omit<VocabularyRelatedWordDraft, "key">,
    value: string,
  ) => {
    onChange(
      words.map((word) => (word.key === key ? { ...word, [field]: value } : word)),
    );
  };

  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        {singular}s <span className="font-normal text-slate-400">(optional)</span>
      </legend>
      <p className="text-xs text-slate-500">{hint}</p>

      {words.length > 0 && (
        <ul className="mt-3 flex flex-col gap-3">
          {words.map((word, index) => {
            const rowErrors = errors[word.key] ?? {};

            return (
              <li
                key={word.key}
                className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3"
              >
                <div className="min-w-0 flex-1 flex flex-col gap-3">
                  <p className="text-xs font-medium text-slate-500">
                    {singular} {index + 1}
                  </p>

                  <Input
                    label={wordLabel}
                    id={`vocabulary-${lower}-${word.key}-word`}
                    name={`${lower}-word-${index}`}
                    maxLength={WORD_MAX_LENGTH}
                    placeholder="e.g. begin"
                    value={word.word}
                    error={rowErrors.word}
                    onChange={(event) =>
                      handleChange(word.key, "word", event.target.value)
                    }
                  />

                  <div className="flex w-full flex-col gap-1">
                    <label
                      htmlFor={`vocabulary-${lower}-${word.key}-sentence`}
                      className="text-sm font-medium text-slate-800"
                    >
                      {sentenceLabel}
                    </label>
                    <textarea
                      id={`vocabulary-${lower}-${word.key}-sentence`}
                      name={`${lower}-sentence-${index}`}
                      rows={2}
                      maxLength={SENTENCE_MAX_LENGTH}
                      placeholder={`Write an example with the ${lower}`}
                      aria-label={`${singular} ${index + 1} sentence`}
                      value={word.sentence}
                      onChange={(event) =>
                        handleChange(word.key, "sentence", event.target.value)
                      }
                      className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                        rowErrors.sentence
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {rowErrors.sentence && (
                      <span className="mt-0.5 block text-xs font-medium text-red-600">
                        {rowErrors.sentence}
                      </span>
                    )}
                  </div>
                </div>

                <TableActionButton
                  tooltip={`Remove ${lower} ${index + 1}`}
                  color="rose"
                  onClick={() =>
                    onChange(words.filter((item) => item.key !== word.key))
                  }
                >
                  <FiTrash2 className="w-4 h-4" />
                </TableActionButton>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="white"
        onClick={() =>
          onChange([...words, { key: createRelatedWordKey(), word: "", sentence: "" }])
        }
        disabled={words.length >= MAX_RELATED_WORDS}
        icon={<FiPlus className="h-4 w-4" />}
        className="mt-4 w-full sm:w-auto"
      >
        {`Add ${lower}`}
      </Button>
    </fieldset>
  );
}
