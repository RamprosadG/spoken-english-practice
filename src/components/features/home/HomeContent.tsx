import { connection } from "next/server";
import { getHomeSummary } from "@/server/services/home.service";
import { HomeView } from "./HomeView";

export function HomeLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-4">
        <div className="h-6 w-44 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white max-sm:h-20"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="h-6 w-52 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[196px] animate-pulse rounded-xl border border-slate-200 bg-white max-sm:h-36"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function HomeContent() {
  // The counts change with every saved record, so this region must never be
  // served from a prerendered snapshot.
  await connection();

  const summary = await getHomeSummary();

  return <HomeView summary={summary} />;
}
