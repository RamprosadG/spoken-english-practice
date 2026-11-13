import type { Metadata } from "next";
import { PracticeHeader } from "@/components/features/practice/PracticeHeader";
import { PracticeWorkspace } from "@/components/features/practice/PracticeWorkspace";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Practice",
  description:
    "Free English speaking workspace. Type or paste any text, hear it in a British or American accent and follow its IPA transcription sentence by sentence.",
  path: "/practice",
});

export default function PracticePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <PracticeHeader />
      <PracticeWorkspace />
    </div>
  );
}
