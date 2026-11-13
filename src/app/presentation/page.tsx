import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PresentationContent,
  PresentationLoading,
} from "@/components/features/presentation/PresentationContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Presentation",
  description:
    "Daily English presentations to read aloud and shadow. Hear each passage in a British or American accent and follow its IPA transcription sentence by sentence.",
  path: "/presentation",
});

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
