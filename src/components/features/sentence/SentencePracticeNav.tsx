import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface SentencePracticeNavProps {
  previousId: string | null;
  nextId: string | null;
}

// Mirrors the secondary `Button` recipe so the link and disabled states match
// every other control in the workspace.
const navButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 transition-all duration-200";

export function SentencePracticeNav({
  previousId,
  nextId,
}: SentencePracticeNavProps) {
  return (
    <nav
      aria-label="Sentence navigation"
      className="flex items-center justify-between gap-3"
    >
      {previousId ? (
        <Link
          href={`/sentences/${previousId}`}
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

      {nextId ? (
        <Link
          href={`/sentences/${nextId}`}
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
