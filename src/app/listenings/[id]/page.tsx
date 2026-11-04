import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { ListeningPracticeNav } from "@/components/features/listening/ListeningPracticeNav";
import { ListeningDictationWorkspace } from "@/features/listening/ListeningDictationWorkspace";
import { getListeningForPractice } from "@/server/services/listening.service";

interface ListeningPracticePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

/**
 * The sentence being practised rides the URL, so a reload or a shared link
 * lands on the same item. Anything out of range falls back to the nearest one.
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
  const listening = await getListeningForPractice(id);

  if (!listening || listening.items.length === 0) {
    notFound();
  }

  const itemNumber = readItemNumber(query, listening.items.length);
  const currentItem = listening.items[itemNumber - 1];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3">
        <Link
          href="/listenings"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to listenings
        </Link>
        <ListeningPracticeNav
          listeningId={listening.id}
          item={itemNumber}
          totalItems={listening.items.length}
        />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
            {listening.title}
          </h1>
          <Badge variant="neutral" size="sm">
            {listening.categoryName}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Play one sentence at a time, write the words you hear, and use the
          per-word hint to fix only what went wrong.
        </p>
      </header>

      <ListeningDictationWorkspace
        key={currentItem.id}
        listeningId={listening.id}
        item={currentItem}
        itemNumber={itemNumber}
        totalItems={listening.items.length}
      />
    </div>
  );
}
