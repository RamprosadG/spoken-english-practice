import type { Metadata } from "next";
import { Suspense } from "react";
import {
  VideoContent,
  VideoLoading,
} from "@/components/features/video/VideoContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Video",
  description:
    "Curated English learning and practice videos. Watch lessons, conversations, and pronunciation guides directly inside the website.",
  path: "/video",
});

export default function VideoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<VideoLoading />}>
        <VideoContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
