import type { ReactNode } from "react";

interface VideoHeaderProps {
  actions: ReactNode;
}

export function VideoHeader({ actions }: VideoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Video
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Watch and learn from curated English practice videos directly inside the platform without any distractions.
        </p>
      </div>
      {/* Unwrapping lets two `w-full` buttons shrink to halves below sm. */}
      <div className="flex items-center gap-3 shrink-0 max-sm:w-full">
        {actions}
      </div>
    </div>
  );
}
