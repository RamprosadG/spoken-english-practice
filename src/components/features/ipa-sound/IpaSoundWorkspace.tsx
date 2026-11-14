"use client";

import Link from "next/link";
import { FiArrowRight, FiSquare } from "react-icons/fi";
import Button from "@/components/ui/buttons/Button";
import { ListenControls } from "@/components/features/practice/ListenControls";
import { PlayTextButton } from "@/components/features/practice/PlayTextButton";
import { useListenSpeech } from "@/components/features/practice/useListenSpeech";
import type { IpaSoundCategory } from "@/lib/ipa-sounds";
import {
  buildIpaCategoryPlayback,
  buildIpaSoundPlayback,
  findIpaPlayback,
  type IpaPlaybackStep,
} from "@/components/features/ipa-sound/ipaSoundPlayback";

interface IpaSoundWorkspaceProps {
  categories: readonly IpaSoundCategory[];
  individual?: boolean;
}

function statusText(
  step: IpaPlaybackStep | undefined,
  individual: boolean,
): string {
  if (!step) {
    return individual
      ? "Choose Listen to hear each sound twice before each of its three example words."
      : "Choose Listen to hear each sound twice, then its first example word, repeated twice.";
  }

  const target = step.kind === "sound" ? "sound" : step.example;
  const cycle = individual
    ? `example ${step.cycle + 1} of 3`
    : `repeat ${step.cycle + 1} of 2`;
  return `Playing /${step.sound.symbol}/ — ${target} · ${cycle}`;
}

export function IpaSoundWorkspace({
  categories,
  individual = false,
}: IpaSoundWorkspaceProps) {
  const speech = useListenSpeech();
  const playback = speech.speakingKey
    ? findIpaPlayback(categories, speech.speakingKey, individual)
    : null;
  const activeStep =
    speech.speakingIndex !== null ? playback?.[speech.speakingIndex] : undefined;

  const listen = (key: string, steps: readonly IpaPlaybackStep[]) => {
    if (speech.speakingKey === key) {
      speech.stop();
    } else {
      speech.playSequence(key, steps.map((step) => step.media));
    }
  };

  return (
    <div>
      <ListenControls speech={speech} oneRow />
      <p className="mt-4 max-w-prose text-sm leading-6 text-slate-500">
        This traditional 44-sound chart uses British IPA. Sounds use recorded IPA
        chart samples: some consonants include surrounding vowels, and diphthongs
        are played as two component vowel recordings. Recordings keep their
        original voice.
      </p>
      <p className="mt-2 max-w-prose text-sm leading-6 text-slate-500">
        Example words use your browser voice. Accent and Voice apply to words
        only; Speed applies to both. American pronunciation and some modern
        British vowels differ, especially /ʊə/ in “pure”.
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500" role="status" aria-live="polite">
          {statusText(activeStep, individual)}
        </p>
        <Button
          variant="secondary"
          size="sm"
          icon={<FiSquare className="h-3.5 w-3.5" />}
          disabled={speech.speakingKey === null}
          onClick={speech.stop}
        >
          Stop
        </Button>
      </div>

      {categories.map((category) => (
        <section
          key={category.slug}
          aria-labelledby={`ipa-${category.slug}`}
          className="mt-6 border-t border-slate-200 pt-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id={`ipa-${category.slug}`} className="text-base font-semibold text-slate-900">
                {category.title}{" "}
                <span className="ml-2 text-xs font-medium text-slate-500">
                  {category.sounds.length} Sounds
                </span>
              </h2>
              <p className="mt-1 max-w-prose text-sm leading-6 text-slate-500">
                {category.description}
              </p>
            </div>
            {!individual && (
              <PlayTextButton
                isPlaying={speech.speakingKey === category.slug}
                onClick={() => listen(category.slug, buildIpaCategoryPlayback(category))}
                ariaLabel={`Listen To ${category.title} Sounds And Examples`}
              />
            )}
          </div>

          <ul className={`mt-4 grid gap-x-6 ${individual ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-3 sm:grid-cols-4 xl:grid-cols-8"}`}>
            {category.sounds.map((sound) => {
              const key = `${category.slug}-${sound.symbol}`;
              const isPlaying = activeStep?.sound === sound;

              return (
                <li
                  key={sound.symbol}
                  aria-current={isPlaying ? "true" : undefined}
                  className={`flex min-w-0 items-start justify-between gap-2 border-b border-slate-100 py-5 ${isPlaying ? "text-indigo-700" : "text-slate-900"}`}
                >
                  <div className="min-w-0">
                    <p className="font-mono text-2xl leading-8">/{sound.symbol}/</p>
                    {individual ? (
                      <ol className="mt-2 space-y-1 text-sm leading-6">
                        {sound.examples.map((example, index) => {
                          const isExamplePlaying =
                            isPlaying &&
                            activeStep?.kind === "example" &&
                            activeStep.cycle === index;

                          return (
                            <li
                              key={example}
                              className={isExamplePlaying ? "font-semibold text-indigo-700" : "text-slate-500"}
                            >
                              <span className="mr-1.5 text-xs text-slate-400">{index + 1}.</span>
                              {example}
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <p className={`mt-1 break-words text-sm ${isPlaying && activeStep?.kind === "example" ? "font-semibold text-indigo-700" : "text-slate-500"}`}>
                        {sound.examples[0]}
                      </p>
                    )}
                  </div>
                  {individual && (
                    <PlayTextButton
                      isPlaying={isPlaying}
                      onClick={() => listen(key, buildIpaSoundPlayback(sound, true))}
                      ariaLabel={`Listen To /${sound.symbol}/ And Three Example Words`}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {!individual && (
            <Link
              href={`/ipa-sound/${category.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Practice {category.title}
              <FiArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      ))}
    </div>
  );
}
