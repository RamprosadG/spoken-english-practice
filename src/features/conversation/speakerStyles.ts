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

/**
 * The same two palettes as quiet text, for the surfaces that carry the names
 * without a chip — the library's first column and its card.
 */
export const SPEAKER_NAME_TEXT_CLASSES: Record<ConversationSpeaker, string> = {
  one: "text-indigo-700",
  two: "text-emerald-700",
};

/** The left rule that keeps a turn row's voice without tinting a box. */
export const SPEAKER_RULE_CLASSES: Record<ConversationSpeaker, string> = {
  one: "border-indigo-300",
  two: "border-emerald-300",
};
