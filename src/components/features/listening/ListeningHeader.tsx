import type { ReactNode } from "react";

interface ListeningHeaderProps {
  actions: ReactNode;
}

export function ListeningHeader({ actions }: ListeningHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Listening practice
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Train your ear, not your eyes. Each listening holds the sentences you
          will dictate: play the audio as often as you like, type what you hear
          one word at a time, and get a hint for only the word you got wrong.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 shrink-0 max-sm:w-full">
        {actions}
      </div>
    </div>
  );
}
