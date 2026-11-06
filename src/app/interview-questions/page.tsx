import { connection } from "next/server";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  InterviewQuestionContent,
  InterviewQuestionLoading,
} from "@/components/features/interview-question/InterviewQuestionContent";
import { canViewInterviewLibrary } from "@/server/services/interview-question.service";

interface InterviewQuestionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// The guard below decides the HTTP status, so this route is never prerendered.
export const instant = false;

export default async function InterviewQuestionsPage({
  searchParams,
}: InterviewQuestionsPageProps) {
  await connection();

  // A signed-out visitor and a public user both land on the real 404 page:
  // this library is private, so there is nothing here for them to see.
  if (!(await canViewInterviewLibrary())) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<InterviewQuestionLoading />}>
        <InterviewQuestionContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
