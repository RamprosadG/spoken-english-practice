import type { ReactNode } from "react";

interface VocabularyHeaderProps {
  actions: ReactNode;
}

export function VocabularyHeader({ actions }: VocabularyHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Important Vocabularies
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Build a word bank that sticks: study each word with its IPA, Bengali
          meaning, and example, then listen to every word and sentence until it
          feels natural.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 max-sm:w-full">
        {actions}
      </div>
    </div>
  );
}
