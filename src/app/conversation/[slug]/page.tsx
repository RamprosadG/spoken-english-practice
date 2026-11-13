import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { ConversationPracticeNav } from "@/components/features/conversation/ConversationPracticeNav";
import { ConversationPracticeWorkspace } from "@/components/features/conversation/ConversationPracticeWorkspace";
import { JsonLd } from "@/components/shared/JsonLd";
import { getConversationWithNavigation } from "@/server/services/conversation.service";
import { metaDescription, metaTitle, pageMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  learningResourceJsonLd,
} from "@/lib/structured-data";

interface ConversationPracticePageProps {
  params: Promise<{ slug: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown ids.
export const instant = false;

export async function generateMetadata({
  params,
}: ConversationPracticePageProps): Promise<Metadata> {
  const { slug } = await params;
  const navigation = await getConversationWithNavigation(slug);

  // A UUID address redirects, so it must not also publish a canonical of its own.
  if (!navigation || slug !== navigation.conversation.slug) {
    return {};
  }

  const { conversation } = navigation;

  return pageMetadata({
    title: metaTitle(conversation.title),
    description: metaDescription(conversation.description),
    path: `/conversation/${conversation.slug}`,
    type: "article",
  });
}

export default async function ConversationPracticePage({
  params,
}: ConversationPracticePageProps) {
  // The record is read per request, so this route is never prerendered.
  await connection();

  const { slug } = await params;
  const navigation = await getConversationWithNavigation(slug);

  if (!navigation) {
    notFound();
  }

  const { conversation, previousSlug, nextSlug } = navigation;

  // A permanent redirect consolidates legacy UUID links onto one public URL.
  if (slug !== conversation.slug) {
    permanentRedirect(`/conversation/${conversation.slug}`);
  }

  const path = `/conversation/${conversation.slug}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Conversation", path: "/conversation" },
            { name: metaTitle(conversation.title), path },
          ]),
          learningResourceJsonLd({
            name: conversation.title,
            description: metaDescription(conversation.description),
            path,
            updatedAt: conversation.updatedAt,
            learningResourceType: "Conversation",
          }),
        ]}
      />
      <div className="flex flex-col gap-3">
        <Link
          href="/conversation"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back To Conversation
        </Link>
        <ConversationPracticeNav previousSlug={previousSlug} nextSlug={nextSlug} />
      </div>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl max-sm:text-lg">
          {conversation.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{conversation.description}</p>
      </header>

      <ConversationPracticeWorkspace
        title={conversation.title}
        speaker1={conversation.speaker1}
        speaker2={conversation.speaker2}
        lines={conversation.lines}
      />
    </div>
  );
}
