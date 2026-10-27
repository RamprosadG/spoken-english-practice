import { Suspense } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

interface PresentationPracticePageProps {
  params: Promise<{ id: string }>;
}

export default function PresentationPracticePage({
  params,
}: PresentationPracticePageProps) {
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
          Presentation practice
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          The practice workspace for this presentation arrives in the next step.
        </p>
      </header>

      <Suspense fallback={<PresentationIdCardFallback />}>
        <PresentationIdCard params={params} />
      </Suspense>
    </div>
  );
}

async function PresentationIdCard({
  params,
}: PresentationPracticePageProps) {
  const { id } = await params;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Presentation ID
      </p>
      <p className="mt-1 break-all font-mono text-sm text-slate-700">{id}</p>
    </div>
  );
}

function PresentationIdCardFallback() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />
    </div>
  );
}
