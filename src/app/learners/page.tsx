import { connection } from "next/server";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  LearnerContent,
  LearnerLoading,
} from "@/components/features/learner/LearnerContent";
import { canManageLearners } from "@/server/services/learner.service";

interface LearnersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Cache Components expects every page to produce a static shell. This route
// cannot: the guard below decides the HTTP status from the session cookies, so
// the whole page is request-time and the validation is opted out of.
export const instant = false;

export default async function LearnersPage({
  searchParams,
}: LearnersPageProps) {
  await connection();

  // A signed-out visitor and a public user both land on the real 404 page:
  // the account list is private, so there is nothing here for them to see.
  if (!(await canManageLearners())) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<LearnerLoading />}>
        <LearnerContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
