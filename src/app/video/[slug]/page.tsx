import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { VideoPracticeNav } from "@/components/features/video/VideoPracticeNav";
import { VideoPlayerWorkspace } from "@/components/features/video/VideoPlayerWorkspace";
import { JsonLd } from "@/components/shared/JsonLd";
import { getVideoWithNavigation } from "@/server/services/video.service";
import { metaTitle, pageMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  learningResourceJsonLd,
} from "@/lib/structured-data";

interface VideoDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: VideoDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const navigation = await getVideoWithNavigation(slug);

  if (!navigation || slug !== navigation.video.slug) {
    return {};
  }

  const { video } = navigation;

  return pageMetadata({
    title: metaTitle(video.title),
    description: `Watch ${video.title} - English video lesson and practice.`,
    path: `/video/${video.slug}`,
    type: "article",
  });
}

export default async function VideoDetailsPage({
  params,
}: VideoDetailsPageProps) {
  await connection();

  const { slug } = await params;
  const navigation = await getVideoWithNavigation(slug);

  if (!navigation) {
    notFound();
  }

  const { video, previousSlug, nextSlug } = navigation;

  if (slug !== video.slug) {
    permanentRedirect(`/video/${video.slug}`);
  }

  const path = `/video/${video.slug}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Video", path: "/video" },
            { name: metaTitle(video.title), path },
          ]),
          learningResourceJsonLd({
            name: video.title,
            description: `Watch ${video.title} directly in the player.`,
            path,
            updatedAt: video.updatedAt,
            learningResourceType: "VideoObject",
          }),
        ]}
      />
      <div className="flex flex-col gap-3">
        <Link
          href="/video"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Video
        </Link>
        <VideoPracticeNav previousSlug={previousSlug} nextSlug={nextSlug} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
          {video.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Watch, listen, and learn with interactive video lessons and real-world conversations.
        </p>
      </header>

      <VideoPlayerWorkspace
        title={video.title}
        link={video.link}
        categoryName={video.categoryName}
      />
    </div>
  );
}
