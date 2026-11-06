import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { InterviewQuestionPracticeNav } from "@/components/features/interview-question/InterviewQuestionPracticeNav";
import { INTERVIEW_DIFFICULTY_BADGE_VARIANTS } from "@/features/interview-question/difficultyStyles";
import { InterviewQuestionPracticeWorkspace } from "@/features/interview-question/InterviewQuestionPracticeWorkspace";
import { getInterviewQuestionWithNavigation } from "@/server/services/interview-question.service";

interface InterviewQuestionPracticePageProps {
  params: Promise<{ id: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export default async function InterviewQuestionPracticePage({
  params,
}: InterviewQuestionPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { id } = await params;
  const navigation = await getInterviewQuestionWithNavigation(id);

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
          href="/interview-questions"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to interview questions
        </Link>
        <InterviewQuestionPracticeNav previousId={previousId} nextId={nextId} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight break-words text-slate-900 sm:text-3xl max-sm:text-lg">
            {question.question}
          </h1>
          <Badge variant="neutral" size="sm">
            {question.categoryName}
          </Badge>
          <Badge variant="neutral" size="sm">
            {question.topicName}
          </Badge>
          <Badge
            variant={INTERVIEW_DIFFICULTY_BADGE_VARIANTS[question.difficulty]}
            size="sm"
          >
            {question.difficulty}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          One voice asks, the other answers: play the exchange, answer it
          yourself out loud, then replay it until the wording is yours.
        </p>
      </header>

      <InterviewQuestionPracticeWorkspace
        question={question.question}
        answer={question.answer}
      />
    </div>
  );
}
