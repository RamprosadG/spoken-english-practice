import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { QuestionPracticeNav } from "@/components/features/question/QuestionPracticeNav";
import { QuestionPracticeWorkspace } from "@/components/features/question/QuestionPracticeWorkspace";
import { getQuestionWithNavigation } from "@/server/services/question.service";

interface QuestionPracticePageProps {
  params: Promise<{ id: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

// This library is private, so it is kept out of the index without reading a row.
export const metadata: Metadata = {
  title: "Question",
  robots: { index: false, follow: false },
};

export default async function QuestionPracticePage({
  params,
}: QuestionPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { id } = await params;
  const navigation = await getQuestionWithNavigation(id);

  // An unknown id and a reader this private library is closed to both land on
  // the not-found page.
  if (!navigation) {
    notFound();
  }

  const { question, previousId, nextId } = navigation;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3">
        <Link
          href="/question"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Question
        </Link>
        <QuestionPracticeNav previousId={previousId} nextId={nextId} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight break-words text-slate-900 sm:text-3xl max-sm:text-lg">
          {question.question}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          One voice asks, the other answers: play the exchange, answer it
          yourself out loud, then replay it until the wording is yours.
        </p>
      </header>

      <QuestionPracticeWorkspace
        question={question.question}
        answer={question.answer}
      />
    </div>
  );
}
