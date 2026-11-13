import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { ListeningPracticeNav } from "@/components/features/listening/ListeningPracticeNav";
import { ListeningPracticeTabs } from "@/components/features/listening/ListeningPracticeTabs";
import { JsonLd } from "@/components/shared/JsonLd";
import { getListeningWithNavigation } from "@/server/services/listening.service";
import { metaTitle, pageMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  learningResourceJsonLd,
} from "@/lib/structured-data";

interface ListeningPracticePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

/** Shared by the meta description and the JSON-LD so the two cannot drift. */
function describeListening(count: number): string {
  return `Dictation practice with ${count} English ${
    count === 1 ? "sentence" : "sentences"
  }: listen, type what you hear and check it word by word, or read the full transcription with IPA.`;
}

export async function generateMetadata({
  params,
}: ListeningPracticePageProps): Promise<Metadata> {
  const { id } = await params;
  const navigation = await getListeningWithNavigation(id);

  if (!navigation) {
    return {};
  }

  const count = navigation.listening.items.length;

  return pageMetadata({
    title: metaTitle(navigation.listening.title),
    description: describeListening(count),
    path: `/listening/${id}`,
    type: "article",
  });
}

/**
 * The sentence being dictated rides the URL, so a reload or a shared link lands
 * on the same item. Anything out of range falls back to the nearest one. The
 * page's own Previous and Next row moves between listenings, not sentences, so
 * it never carries this parameter.
 */
function readItemNumber(
  searchParams: { [key: string]: string | string[] | undefined },
  totalItems: number,
): number {
  const raw = Array.isArray(searchParams.item)
    ? searchParams.item[0]
    : searchParams.item;
  const parsed = Number.parseInt(raw ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(Math.max(parsed, 1), totalItems);
}

export default async function ListeningPracticePage({
  params,
  searchParams,
}: ListeningPracticePageProps) {
  // The record and the reader's role are both read per request.
  await connection();

  const { id } = await params;
  const query = await searchParams;
  const navigation = await getListeningWithNavigation(id);

  if (!navigation || navigation.listening.items.length === 0) {
    notFound();
  }

  const { listening, previousId, nextId } = navigation;
  const itemNumber = readItemNumber(query, listening.items.length);
  const path = `/listening/${id}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Listening", path: "/listening" },
            { name: metaTitle(listening.title), path },
          ]),
          learningResourceJsonLd({
            name: listening.title,
            description: describeListening(listening.items.length),
            path,
            updatedAt: listening.updatedAt,
            learningResourceType: "Dictation",
          }),
        ]}
      />
      <div className="flex flex-col gap-3">
        <Link
          href="/listening"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Listening
        </Link>
        <ListeningPracticeNav previousId={previousId} nextId={nextId} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
          {listening.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Work the sentences out by ear one at a time, or open the full
          transcription to read every one of them and hear the whole listening
          at once.
        </p>
      </header>

      <ListeningPracticeTabs
        listeningId={listening.id}
        items={listening.items}
        itemNumber={itemNumber}
      />
    </div>
  );
}
