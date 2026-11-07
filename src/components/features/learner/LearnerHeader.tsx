import type { ReactNode } from "react";

interface LearnerHeaderProps {
  actions: ReactNode;
}

export function LearnerHeader({ actions }: LearnerHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Active learners
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Every account in the app — the learners who practise and the admins
          who curate the libraries. Add someone, change what they are allowed to
          do, or remove an account that is no longer in use.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 max-sm:w-full">
        {actions}
      </div>
    </div>
  );
}
