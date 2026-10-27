import type { ReactNode } from "react";

interface SentenceHeaderProps {
  actions: ReactNode;
}

export function SentenceHeader({ actions }: SentenceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Common sentences
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Master one sentence at a time: read the English, check the Bengali
          meaning, study the IPA, and listen until the rhythm feels familiar.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 max-sm:w-full">
        {actions}
      </div>
    </div>
  );
}
