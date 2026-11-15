"use client";

import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface VideoPracticeNavProps {
  previousSlug: string | null;
  nextSlug: string | null;
}

export function VideoPracticeNav({
  previousSlug,
  nextSlug,
}: VideoPracticeNavProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
      {previousSlug ? (
        <Link
          href={`/video/${previousSlug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-indigo-300 hover:text-indigo-600 max-sm:text-[11px]"
        >
          <FiChevronLeft className="h-4 w-4" />
          Previous Video
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400 max-sm:text-[11px]"
        >
          <FiChevronLeft className="h-4 w-4" />
          Previous Video
        </span>
      )}

      {nextSlug ? (
        <Link
          href={`/video/${nextSlug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-indigo-300 hover:text-indigo-600 max-sm:text-[11px]"
        >
          Next Video
          <FiChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400 max-sm:text-[11px]"
        >
          Next Video
          <FiChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
