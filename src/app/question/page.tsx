import { connection } from "next/server";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  QuestionContent,
  QuestionLoading,
} from "@/components/features/question/QuestionContent";
import { canViewQuestionLibrary } from "@/server/services/question.service";

interface QuestionPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// The guard below decides the HTTP status, so this route is never prerendered.
export const instant = false;

export default async function QuestionPage({
  searchParams,
}: QuestionPageProps) {
  await connection();

  // A signed-out visitor and a public user both land on the real 404 page:
  // this library is private, so there is nothing here for them to see.
  if (!(await canViewQuestionLibrary())) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<QuestionLoading />}>
        <QuestionContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
