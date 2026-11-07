import type { ReactNode } from "react";

interface InterviewQuestionHeaderProps {
  actions: ReactNode;
}

export function InterviewQuestionHeader({
  actions,
}: InterviewQuestionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Interview questions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Save the questions you are likely to be asked and the answers you want
          to give, then rehearse both sides out loud — the interviewer asks, you
          answer.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 max-sm:w-full">
        {actions}
      </div>
    </div>
  );
}
