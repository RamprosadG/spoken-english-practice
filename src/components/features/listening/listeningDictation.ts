/**
 * Dictation matching runs in the browser, so this module is the whole rule set
 * the learner is judged against.
 */

export function splitWords(text: string): string[] {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/) : [];
}

/**
 * Case, surrounding punctuation and apostrophe spelling are not part of the
 * exercise, so "Don't", "don’t" and "dont" all count as the same word.
 */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/[^a-z0-9]+$/, "");
}

export interface DictationCheck {
  /** One entry per expected word: true when the typed word in that position matches. */
  slots: boolean[];
  wrongIndexes: number[];
  /** Typed words past the end of the sentence — an over-long answer is not correct. */
  extraWords: string[];
  typedCount: number;
  isComplete: boolean;
}

export function checkDictation(
  expected: string[],
  typed: string[],
): DictationCheck {
  const slots = expected.map(
    (word, index) => normalizeWord(typed[index] ?? "") === normalizeWord(word),
  );

  const wrongIndexes = slots.reduce<number[]>(
    (indexes, correct, index) => {
      if (!correct) indexes.push(index);
      return indexes;
    },
    [],
  );
  const extraWords = typed.slice(expected.length);

  return {
    slots,
    wrongIndexes,
    extraWords,
    typedCount: typed.length,
    isComplete: wrongIndexes.length === 0 && extraWords.length === 0,
  };
}
