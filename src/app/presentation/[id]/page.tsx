import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { PresentationPracticeNav } from "@/components/features/presentation/PresentationPracticeNav";
import { PresentationPracticeWorkspace } from "@/components/features/presentation/PresentationPracticeWorkspace";
import { getPresentationWithNavigation } from "@/server/services/presentation.service";
import { metaDescription, metaTitle, pageMetadata } from "@/lib/seo";

interface PresentationPracticePageProps {
  params: Promise<{ id: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export async function generateMetadata({
  params,
}: PresentationPracticePageProps): Promise<Metadata> {
  const { id } = await params;
  const navigation = await getPresentationWithNavigation(id);

  // A missing row or a draft this reader may not see stays on the root metadata;
  // the page below answers the 404.
  if (!navigation) {
    return {};
  }

  return pageMetadata({
    title: metaTitle(navigation.presentation.title),
    description: metaDescription(navigation.presentation.text),
    path: `/presentation/${id}`,
    type: "article",
  });
}

export default async function PresentationPracticePage({
  params,
}: PresentationPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { id } = await params;
  const navigation = await getPresentationWithNavigation(id);

  if (!navigation) {
    notFound();
  }

  const { presentation, previousId, nextId } = navigation;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3">
        <Link
          href="/presentation"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Presentation
        </Link>
        <PresentationPracticeNav previousId={previousId} nextId={nextId} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
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
