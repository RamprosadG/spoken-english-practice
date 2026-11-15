import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { StoryPracticeNav } from "@/components/features/story/StoryPracticeNav";
import { StoryPracticeWorkspace } from "@/components/features/story/StoryPracticeWorkspace";
import { JsonLd } from "@/components/shared/JsonLd";
import { getStoryWithNavigation } from "@/server/services/story.service";
import { metaDescription, metaTitle, pageMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  learningResourceJsonLd,
} from "@/lib/structured-data";

interface StoryPracticePageProps {
  params: Promise<{ slug: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export async function generateMetadata({
  params,
}: StoryPracticePageProps): Promise<Metadata> {
  const { slug } = await params;
  const navigation = await getStoryWithNavigation(slug);

  // A UUID address redirects, so it must not also publish a canonical of its own.
  if (!navigation || slug !== navigation.story.slug) {
    return {};
  }

  const { story } = navigation;

  return pageMetadata({
    title: metaTitle(story.title),
    description: metaDescription(story.text),
    path: `/story/${story.slug}`,
    type: "article",
  });
}

export default async function StoryPracticePage({
  params,
}: StoryPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { slug } = await params;
  const navigation = await getStoryWithNavigation(slug);

  if (!navigation) {
    notFound();
  }

  const { story, previousSlug, nextSlug } = navigation;

  // A permanent redirect consolidates legacy UUID links onto one public URL.
  if (slug !== story.slug) {
    permanentRedirect(`/story/${story.slug}`);
  }

  const path = `/story/${story.slug}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Story", path: "/story" },
            { name: metaTitle(story.title), path },
          ]),
          learningResourceJsonLd({
            name: story.title,
            description: metaDescription(story.text),
            path,
            updatedAt: story.updatedAt,
            learningResourceType: "Story",
          }),
        ]}
      />
      <div className="flex flex-col gap-3">
        <Link
          href="/story"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Story
        </Link>
        <StoryPracticeNav previousSlug={previousSlug} nextSlug={nextSlug} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
          {story.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Listen, imitate, repeat: follow the IPA, shadow the speaker&apos;s
          stress and intonation, and revisit this story daily until the words
          flow naturally.
        </p>
      </header>

      <StoryPracticeWorkspace text={story.text} />
    </div>
  );
}