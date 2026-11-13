"use client";

import { useState } from "react";
import { ListeningDictationWorkspace } from "./ListeningDictationWorkspace";
import { ListeningTranscriptionWorkspace } from "./ListeningTranscriptionWorkspace";
import type { ListeningItem } from "@/types/listening";

type ListeningTab = "dictation" | "transcription";

const TABS: { id: ListeningTab; label: string }[] = [
  { id: "dictation", label: "Dictation" },
  { id: "transcription", label: "Full Transcription" },
];

interface ListeningPracticeTabsProps {
  listeningSlug: string;
  items: ListeningItem[];
  itemNumber: number;
}

/**
 * Two ways to work through one listening. The dictation tab stays mounted when
 * hidden so a half-typed sentence survives a look at the answers; the
 * transcription tab mounts only while it is open, because that is the only
 * place the IPA data is ever needed, and closing it unmounts the playback.
 */
export function ListeningPracticeTabs({
  listeningSlug,
  items,
  itemNumber,
}: ListeningPracticeTabsProps) {
  const [tab, setTab] = useState<ListeningTab>("dictation");
  const currentItem = items[itemNumber - 1];

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.findIndex(({ id }) => id === tab);
    const last = TABS.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };

    const target = targets[event.key];

    if (target === undefined) {
      return;
    }

    event.preventDefault();
    setTab(TABS[target].id);
  };

  return (
    <section className="flex w-full flex-col gap-6">
      <div
        role="tablist"
        aria-label="Listening Practice Mode"
        className="flex items-center gap-1 border-b border-slate-200"
      >
        {TABS.map(({ id, label }) => {
          const isSelected = tab === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`listening-tab-${id}`}
              aria-controls={`listening-panel-${id}`}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={handleTabKeyDown}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors max-sm:text-xs ${
                isSelected
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="listening-panel-dictation"
        aria-labelledby="listening-tab-dictation"
        hidden={tab !== "dictation"}
      >
        {/* Keyed by the sentence, so moving to the next one starts a clean card
            and cancels the audio, exactly as the separate route did before. */}
        <ListeningDictationWorkspace
          key={currentItem.id}
          listeningSlug={listeningSlug}
          item={currentItem}
          itemNumber={itemNumber}
          totalItems={items.length}
          isActive={tab === "dictation"}
        />
      </div>

      {tab === "transcription" && (
        <div
          role="tabpanel"
          id="listening-panel-transcription"
          aria-labelledby="listening-tab-transcription"
        >
          <ListeningTranscriptionWorkspace items={items} />
        </div>
      )}
    </section>
  );
}
