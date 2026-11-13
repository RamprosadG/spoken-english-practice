import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { PresentationPracticeNav } from "@/components/features/presentation/PresentationPracticeNav";
import { PresentationPracticeWorkspace } from "@/components/features/presentation/PresentationPracticeWorkspace";
import { JsonLd } from "@/components/shared/JsonLd";
import { getPresentationWithNavigation } from "@/server/services/presentation.service";
import { metaDescription, metaTitle, pageMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  learningResourceJsonLd,
} from "@/lib/structured-data";

interface PresentationPracticePageProps {
  params: Promise<{ slug: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export async function generateMetadata({
  params,
}: PresentationPracticePageProps): Promise<Metadata> {
  const { slug } = await params;
  const navigation = await getPresentationWithNavigation(slug);

  // A UUID address redirects, so it must not also publish a canonical of its own.
  if (!navigation || slug !== navigation.presentation.slug) {
    return {};
  }

  const { presentation } = navigation;

  return pageMetadata({
    title: metaTitle(presentation.title),
    description: metaDescription(presentation.text),
    path: `/presentation/${presentation.slug}`,
    type: "article",
  });
}

export default async function PresentationPracticePage({
  params,
}: PresentationPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { slug } = await params;
  const navigation = await getPresentationWithNavigation(slug);

  if (!navigation) {
    notFound();
  }

  const { presentation, previousSlug, nextSlug } = navigation;

  // A permanent redirect consolidates legacy UUID links onto one public URL.
  if (slug !== presentation.slug) {
    permanentRedirect(`/presentation/${presentation.slug}`);
  }

  const path = `/presentation/${presentation.slug}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Presentation", path: "/presentation" },
            { name: metaTitle(presentation.title), path },
          ]),
          learningResourceJsonLd({
            name: presentation.title,
            description: metaDescription(presentation.text),
            path,
            updatedAt: presentation.updatedAt,
            learningResourceType: "Presentation",
          }),
        ]}
      />
      <div className="flex flex-col gap-3">
        <Link
          href="/presentation"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Presentation
        </Link>
        <PresentationPracticeNav previousSlug={previousSlug} nextSlug={nextSlug} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
          {presentation.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Listen, imitate, repeat: follow the IPA, shadow the speaker&apos;s
          stress and intonation, and revisit this passage daily until the words
          flow naturally.
        </p>
      </header>

      <PresentationPracticeWorkspace text={presentation.text} />
    </div>
  );
}
