import type { Accent } from "./useSpeechPractice";

export interface VoiceOption {
  value: string;
  label: string;
}

const FEMALE_VOICE_TOKENS = new Set([
  "female",
  "woman",
  "zira",
  "susan",
  "sandra",
  "heera",
  "heyzuna",
  "naomi",
  "kore",
  "hoda",
  "tessa",
  "fiona",
  "serena",
  "catherine",
  "hazel",
  "linda",
  "aria",
  "june",
  "jade",
  "sofia",
  "libby",
  "sonia",
  "lottie",
  "clara",
  "amy",
  "emma",
  "olivia",
  "isabella",
  "karen",
  "moira",
  "veena",
  "priya",
  "swara",
  "kalinda",
  "leah",
  "nora",
  "marie",
  "martha",
  "joana",
  "carmen",
  "yelda",
  "samantha",
  "victoria",
]);

const MALE_VOICE_TOKENS = new Set([
  "male",
  "man",
  "david",
  "mark",
  "george",
  "james",
  "rishi",
  "prem",
  "fred",
  "alex",
  "daniel",
  "gregory",
  "arthur",
  "oliver",
  "thomas",
  "william",
  "aaron",
  "brian",
  "paul",
  "stuart",
  "neil",
  "guy",
  "roger",
  "diego",
  "juan",
]);

function voiceTokens(voice: SpeechSynthesisVoice): string[] {
  return `${voice.name} ${voice.voiceURI}`
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
}

/**
 * The Web Speech API exposes no gender metadata, so this is a name heuristic
 * used only to pick a sensible default and to label the voice list.
 */
export function guessVoiceGender(
  voice: SpeechSynthesisVoice,
): "female" | "male" | null {
  const tokens = voiceTokens(voice);
  if (tokens.some((token) => FEMALE_VOICE_TOKENS.has(token))) return "female";
  if (tokens.some((token) => MALE_VOICE_TOKENS.has(token))) return "male";
  return null;
}

function accentMatches(
  voice: SpeechSynthesisVoice,
  accent: Accent,
): boolean {
  return voice.lang
    .replace("_", "-")
    .toLowerCase()
    .startsWith(accent.toLowerCase());
}

export function voicesForAccent(
  voices: SpeechSynthesisVoice[],
  accent: Accent,
): SpeechSynthesisVoice[] {
  return voices.filter((voice) => accentMatches(voice, accent));
}

/** "Automatic" keeps the engine default, so it is always the first option. */
export function buildVoiceOptions(
  voices: SpeechSynthesisVoice[],
  accent: Accent,
): VoiceOption[] {
  return [
    { value: "", label: "Automatic (best match)" },
    ...voicesForAccent(voices, accent).map((voice) => {
      const gender = guessVoiceGender(voice);
      return {
        value: voice.voiceURI,
        label: gender ? `${voice.name} · ${gender}` : voice.name,
      };
    }),
  ];
}

/** The hand-picked voice wins; otherwise the caller keeps its own default. */
export function findPickedVoice(
  voices: SpeechSynthesisVoice[],
  pickedVoiceURI: string,
): SpeechSynthesisVoice | null {
  if (!pickedVoiceURI) return null;

  return voices.find((voice) => voice.voiceURI === pickedVoiceURI) ?? null;
}
