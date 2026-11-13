import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface SentencePracticeNavProps {
  previousSlug: string | null;
  nextSlug: string | null;
}

// Mirrors the secondary `Button` recipe so the link and disabled states match
// every other control in the workspace. Below `sm` the same string takes the
// 12 px / 28 px recipe the **Listen** pills already use, because two 14 px
// pills crowd a phone-width row.
const navButtonClass =
  "inline-flex items-center justify-center gap-2 max-sm:gap-1.5 rounded-lg bg-slate-700 px-4 py-2 max-sm:px-3 max-sm:py-1.5 text-sm max-sm:text-xs font-medium text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 transition-all duration-200";

export function SentencePracticeNav({
  previousSlug,
  nextSlug,
}: SentencePracticeNavProps) {
  return (
    <nav
      aria-label="Sentence Navigation"
      className="flex items-center justify-between gap-3"
    >
      {previousSlug ? (
        <Link
          href={`/sentence/${previousSlug}`}
          className={`${navButtonClass} cursor-pointer hover:bg-slate-800 active:bg-slate-900 hover:shadow-md`}
        >
          <FiChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={`${navButtonClass} cursor-not-allowed opacity-60`}
        >
          <FiChevronLeft className="h-4 w-4" />
          Previous
        </button>
      )}

      {nextSlug ? (
        <Link
          href={`/sentence/${nextSlug}`}
          className={`${navButtonClass} cursor-pointer hover:bg-slate-800 active:bg-slate-900 hover:shadow-md`}
        >
          Next
          <FiChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={`${navButtonClass} cursor-not-allowed opacity-60`}
        >
          Next
          <FiChevronRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
}
