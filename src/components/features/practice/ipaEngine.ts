import type { Accent } from "@/components/features/practice/useSpeechPractice";

const VOICE_BY_ACCENT: Record<Accent, string> = {
  "en-GB": "en-gb-x-rp",
  "en-US": "en-us",
};

// Verbatim copy of node_modules/espeak-phonemizer/dist (minus ru.data); re-copy on a version bump.
const ASSET_BASE = "/espeak/dist";

// Native ESM, not bundled: Turbopack fails on the package's Node-only `new URL('../dist', import.meta.url)`.
const ENGINE_MODULE: string = `${ASSET_BASE}/espeak.mjs`;

// eSpeak emits narrow / allophonic symbols; dictionaries print the right-hand side.
const NOTATION: readonly (readonly [RegExp, string])[] = [
  [/ʲ/g, ""],
  [/ᵻ/g, "ɪ"],
  [/ɐ/g, "ə"],
  // eSpeak writes the r of "around" twice, as ɚ + ɹ; one r survives, as the next onset.
  [/ɚɹ?/g, "ər"],
  [/ɾ/g, "t"],
  [/ɹ/g, "r"],
];

const VOWELS = "aeiouəɪʊɛæɒɔɜɑʌɐᵻɝɚ";
// ː is excluded from the onset class, or "jɔːsˈɛlf" restresses to "jɔˈːsɛlf".
const STRESS_PLACEMENT = new RegExp(
  `([^${VOWELS}ˈˌː\\s]+)([ˈˌ])([${VOWELS}])`,
  "g",
);

type Engine = typeof import("espeak-phonemizer");

let enginePromise: Promise<Engine> | null = null;
let pending: Promise<void> = Promise.resolve();
let activeVoice: string | null = null;

function loadEngine(): Promise<Engine> {
  if (!enginePromise) {
    // initialize() guards only after awaiting, so memoising the promise is what makes it single-flight.
    enginePromise = (async () => {
      const engine = (await import(
        /* turbopackIgnore: true */ ENGINE_MODULE
      )) as Engine;
      await engine.initialize(ASSET_BASE);
      return engine;
    })().catch((error: unknown) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
}

function toDictionaryNotation(raw: string): string {
  let out = raw;
  for (const [pattern, replacement] of NOTATION) {
    out = out.replace(pattern, replacement);
  }
  // eSpeak marks stress before the vowel; dictionaries mark the whole syllable.
  return out.replace(
    STRESS_PLACEMENT,
    (_match, onset: string, mark: string, vowel: string) => mark + onset + vowel,
  );
}

export function transcribe(text: string, accent: Accent): Promise<string> {
  const voice = VOICE_BY_ACCENT[accent];

  // setVoice mutates global engine state, so concurrent surfaces on different
  // accents must not interleave between setting the voice and reading phonemes.
  const result = pending.then(async () => {
    const engine = await loadEngine();
    if (activeVoice !== voice) {
      await engine.setVoice(voice);
      activeVoice = voice;
    }
    const clauses = engine
      .getPhonemes(text)
      .map((clause) => clause.phonemes + clause.terminator)
      .join(" ");
    return toDictionaryNotation(clauses);
  });

  pending = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}