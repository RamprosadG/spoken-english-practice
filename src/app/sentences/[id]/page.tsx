import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { SentencePracticeNav } from "@/components/features/sentence/SentencePracticeNav";
import { SentencePracticePanel } from "@/features/sentence/SentencePracticePanel";
import { getSentenceWithNavigation } from "@/server/services/sentence.service";

interface SentencePracticePageProps {
  params: Promise<{ id: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export default async function SentencePracticePage({
  params,
}: SentencePracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { id } = await params;
  const navigation = await getSentenceWithNavigation(id);

  if (!navigation) {
    notFound();
  }

  const { sentence, previousId, nextId } = navigation;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3">
        <Link
          href="/sentences"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to sentences
        </Link>
        <SentencePracticeNav previousId={previousId} nextId={nextId} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
            {sentence.text}
          </h1>
          <Badge variant="neutral" size="sm">
            {sentence.categoryName}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Pick your accent, voice and speed, then listen and say the sentence out
          loud until it comes without thinking.
        </p>
      </header>

      <SentencePracticePanel sentence={sentence} />
    </div>
  );
}
