import type { ConversationSpeaker } from "@/types/conversation";

/**
 * One palette per speaker, so a turn reads the same in the library, the
 * conversation card and the IPA card.
 */
export const SPEAKER_BADGE_VARIANTS: Record<
  ConversationSpeaker,
  "info" | "success"
> = {
  one: "info",
  two: "success",
};

export const SPEAKER_ROW_CLASSES: Record<ConversationSpeaker, string> = {
  one: "border-indigo-200 bg-indigo-50/60",
  two: "border-emerald-200 bg-emerald-50/60",
};
