const ALWAYS_JOIN_ABBREVIATIONS = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "sr",
  "jr",
  "st",
  "vs",
]);

const CONDITIONAL_JOIN_ABBREVIATIONS = new Set([
  "e.g",
  "i.e",
  "a.m",
  "p.m",
  "u.s",
  "u.k",
  "jan",
  "feb",
  "mar",
  "apr",
  "jun",
  "jul",
  "aug",
  "sep",
  "sept",
  "oct",
  "nov",
  "dec",
]);

function needsContinuation(sentence: string, next: string): boolean {
  const withoutClosing = sentence.replace(/["'”’)\]]+$/, "");
  if (!withoutClosing.endsWith(".")) return false;

  const token = withoutClosing.slice(0, -1).trim();
  const rawLastWord = token.split(/\s+/).pop() ?? token;
  const lastWord = rawLastWord.toLowerCase();
  const nextStartsLowerOrDigit = /^[a-z0-9]/.test(next);

  if (ALWAYS_JOIN_ABBREVIATIONS.has(lastWord)) return true;
  if (/^[A-Z]$/.test(rawLastWord) && token.length === 1) return true;
  if (/^\d+\.$/.test(withoutClosing)) return true;
  if (CONDITIONAL_JOIN_ABBREVIATIONS.has(lastWord)) {
    return nextStartsLowerOrDigit;
  }

  return false;
}

/**
 * One sentence per returned line: `Intl.Segmenter` does the work, a newline is
 * a hard boundary, and a segment that ends in a known abbreviation, a single
 * capital initial, or a list number is joined back onto the line before it.
 */
export function splitIntoSentences(text: string): string[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  const sentences: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;

    for (const { segment } of segmenter.segment(line)) {
      const sentence = segment.trim();
      if (!sentence) continue;

      const previous = sentences[sentences.length - 1];
      if (previous && needsContinuation(previous, sentence)) {
        sentences[sentences.length - 1] = `${previous} ${sentence}`;
      } else {
        sentences.push(sentence);
      }
    }
  }

  return sentences;
}
