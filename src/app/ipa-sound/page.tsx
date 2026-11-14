import type { Metadata } from "next";
import { IpaSoundHeader } from "@/components/features/ipa-sound/IpaSoundHeader";
import { IpaSoundWorkspace } from "@/components/features/ipa-sound/IpaSoundWorkspace";
import { JsonLd } from "@/components/shared/JsonLd";
import { IPA_SOUND_CATEGORIES } from "@/lib/ipa-sounds";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "IPA Sound",
  description: "Explore 44 English IPA sounds: 7 short vowels, 5 long vowels, 8 diphthongs and 24 consonants. Hear recorded sounds and example words in each category.",
  path: "/ipa-sound",
});

export default function IpaSoundPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "IPA Sound", path: "/ipa-sound" },
      ])} />
      <IpaSoundHeader />
      <IpaSoundWorkspace categories={IPA_SOUND_CATEGORIES} />
    </div>
  );
}
