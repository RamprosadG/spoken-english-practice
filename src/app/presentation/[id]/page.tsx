import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { PresentationPracticeWorkspace } from "@/features/presentation/PresentationPracticeWorkspace";
import { getPresentationById } from "@/server/services/presentation.service";

interface PresentationPracticePageProps {
  params: Promise<{ id: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export default async function PresentationPracticePage({
  params,
}: PresentationPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { id } = await params;
  const presentation = await getPresentationById(id);

  if (!presentation) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <header className="border-b border-slate-200 pb-5">
        <Link
          href="/presentation"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to presentations
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
          {presentation.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Listen, imitate, repeat: follow the IPA, shadow the speaker&apos;s
          stress and intonation, and revisit this passage daily until the words
          flow naturally.
        </p>
      </header>

      <PresentationPracticeWorkspace text={presentation.text} />
    </div>
  );
}
