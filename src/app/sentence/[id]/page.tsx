import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { SentencePracticeNav } from "@/components/features/sentence/SentencePracticeNav";
import { SentencePracticePanel } from "@/components/features/sentence/SentencePracticePanel";
import { JsonLd } from "@/components/shared/JsonLd";
import { getSentenceWithNavigation } from "@/server/services/sentence.service";
import { metaDescription, metaTitle, pageMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  learningResourceJsonLd,
} from "@/lib/structured-data";

interface SentencePracticePageProps {
  params: Promise<{ id: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

/** Shared by the meta description and the JSON-LD so the two cannot drift. */
function describeSentence(sentence: {
  text: string;
  meaning: string;
  whenToUse: string | null;
}): string {
  return sentence.whenToUse
    ? `${sentence.text} — ${sentence.meaning}. ${sentence.whenToUse}`
    : `${sentence.text} — ${sentence.meaning}`;
}

export async function generateMetadata({
  params,
}: SentencePracticePageProps): Promise<Metadata> {
  const { id } = await params;
  const navigation = await getSentenceWithNavigation(id);

  if (!navigation) {
    return {};
  }

  const { sentence } = navigation;

  return pageMetadata({
    title: metaTitle(sentence.text),
    description: metaDescription(describeSentence(sentence)),
    path: `/sentence/${id}`,
    type: "article",
  });
}

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
  const path = `/sentence/${id}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Sentence", path: "/sentence" },
            { name: metaTitle(sentence.text), path },
          ]),
          learningResourceJsonLd({
            name: sentence.text,
            description: metaDescription(describeSentence(sentence)),
            path,
            updatedAt: sentence.updatedAt,
            learningResourceType: "Sentence",
          }),
        ]}
      />
      <div className="flex flex-col gap-3">
        <Link
          href="/sentence"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Sentence
        </Link>
        <SentencePracticeNav previousId={previousId} nextId={nextId} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
            {sentence.text}
          </h1>
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
