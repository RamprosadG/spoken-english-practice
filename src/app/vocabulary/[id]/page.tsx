import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { VocabularyPracticeNav } from "@/components/features/vocabulary/VocabularyPracticeNav";
import { InlineIpa } from "@/features/practice/InlineIpa";
import { VocabularyPracticePanel } from "@/features/vocabulary/VocabularyPracticePanel";
import { getVocabularyWithNavigation } from "@/server/services/vocabulary.service";

interface VocabularyPracticePageProps {
  params: Promise<{ id: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export default async function VocabularyPracticePage({
  params,
}: VocabularyPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { id } = await params;
  const navigation = await getVocabularyWithNavigation(id);

  if (!navigation) {
    notFound();
  }

  const { vocabulary, previousId, nextId } = navigation;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3">
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to vocabularies
        </Link>
        <VocabularyPracticeNav previousId={previousId} nextId={nextId} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        {/* The headword line is a dictionary entry, exactly the three-line stack
            the library's Word cell uses: the word, its part of speech as quiet
            italic text beside it, then the IPA under it. The label sits outside
            the <h1> so the heading names the word alone, and baseline alignment
            keeps it on the word's line instead of floating above it. */}
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
            {vocabulary.text}
          </h1>
          <span className="text-xs font-medium italic text-slate-500 sm:text-lg">
            {vocabulary.partsOfSpeech}
          </span>
        </div>
        <InlineIpa text={vocabulary.text} accent="en-GB" />
        <p className="mt-2 text-sm text-slate-500">
          Listen to the word, its example sentence and every synonym and antonym,
          then say each one out loud in your own accent.
        </p>
      </header>

      <VocabularyPracticePanel vocabulary={vocabulary} />
    </div>
  );
}
