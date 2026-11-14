import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { IpaSoundHeader } from "@/components/features/ipa-sound/IpaSoundHeader";
import { IpaSoundWorkspace } from "@/components/features/ipa-sound/IpaSoundWorkspace";
import { JsonLd } from "@/components/shared/JsonLd";
import { findIpaSoundCategory, IPA_SOUND_CATEGORIES } from "@/lib/ipa-sounds";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/structured-data";

interface IpaSoundCategoryPageProps {
  params: Promise<{ category: string }>;
}

// Blocking this route keeps the HTTP status honest (404) for unknown categories.
export const instant = false;

export function generateStaticParams() {
  return IPA_SOUND_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: IpaSoundCategoryPageProps): Promise<Metadata> {
  const category = findIpaSoundCategory((await params).category);
  if (!category) notFound();

  return pageMetadata({
    title: `${category.title} | IPA Sound`,
    description: `Practise ${category.sounds.length} English ${category.title.toLowerCase()} sounds with IPA symbols, recorded sounds and three example words per sound.`,
    path: `/ipa-sound/${category.slug}`,
  });
}

export default async function IpaSoundCategoryPage({ params }: IpaSoundCategoryPageProps) {
  const category = findIpaSoundCategory((await params).category);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "IPA Sound", path: "/ipa-sound" },
        { name: category.title, path: `/ipa-sound/${category.slug}` },
      ])} />
      <Link
        href="/ipa-sound"
        className="inline-flex self-start items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back To IPA Sound
      </Link>
      <IpaSoundHeader category={category} />
      <IpaSoundWorkspace key={category.slug} categories={[category]} individual />
    </div>
  );
}
