import type { IpaSound, IpaSoundCategory } from "@/lib/ipa-sounds";
import type { ListenStep } from "@/components/features/practice/useListenSpeech";

export interface IpaPlaybackStep {
  sound: IpaSound;
  kind: "sound" | "example";
  example: string;
  cycle: number;
  media: ListenStep;
}

export function buildIpaSoundPlayback(
  sound: IpaSound,
  individual: boolean,
): IpaPlaybackStep[] {
  const examples = individual
    ? sound.examples
    : [sound.examples[0], sound.examples[0]];
  const steps: IpaPlaybackStep[] = [];

  for (const [cycle, example] of examples.entries()) {
    for (let repeat = 0; repeat < 2; repeat += 1) {
      for (const audioUrl of sound.audioUrls) {
        steps.push({ sound, kind: "sound", example, cycle, media: { audioUrl } });
      }
    }
    steps.push({ sound, kind: "example", example, cycle, media: example });
  }

  return steps;
}

export function buildIpaCategoryPlayback(
  category: IpaSoundCategory,
): IpaPlaybackStep[] {
  return category.sounds.flatMap((sound) => buildIpaSoundPlayback(sound, false));
}

export function findIpaPlayback(
  categories: readonly IpaSoundCategory[],
  key: string,
  individual: boolean,
): IpaPlaybackStep[] | null {
  if (individual) {
    for (const category of categories) {
      const sound = category.sounds.find(
        (candidate) => `${category.slug}-${candidate.symbol}` === key,
      );
      if (sound) return buildIpaSoundPlayback(sound, true);
    }
    return null;
  }

  const category = categories.find((candidate) => candidate.slug === key);
  return category ? buildIpaCategoryPlayback(category) : null;
}
