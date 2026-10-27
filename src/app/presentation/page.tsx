import { Suspense } from "react";
import {
  PresentationContent,
  PresentationLoading,
} from "@/components/features/presentation/PresentationContent";

export default function PresentationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<PresentationLoading />}>
        <PresentationContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
