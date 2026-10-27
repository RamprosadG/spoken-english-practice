import type { ReactNode } from "react";

interface PresentationHeaderProps {
  actions: ReactNode;
}

export function PresentationHeader({ actions }: PresentationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Presentation
        </h1>
        <p className="mt-1 text-sm text-gray-500 max-sm:hidden">
          Browse saved English texts, search by title, and open one to start
          practicing.
        </p>
      </div>
      <div className="flex items-center gap-3 max-sm:w-full">{actions}</div>
    </div>
  );
}
