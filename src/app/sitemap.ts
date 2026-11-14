import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { IPA_SOUND_CATEGORIES } from "@/lib/ipa-sounds";
import { getSitemapLibraries } from "@/server/services/sitemap.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const libraries = await getSitemapLibraries();

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/ipa-sound`, changeFrequency: "monthly", priority: 0.9 },
    ...IPA_SOUND_CATEGORIES.map((category) => ({
      url: `${SITE_URL}/ipa-sound/${category.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/practice`, changeFrequency: "monthly", priority: 0.8 },
  ];

  for (const library of libraries) {
    // A list page changes when its newest row does, not when the sitemap is read.
    const lastModified = library.rows.reduce<Date | undefined>(
      (newest, row) =>
        newest && newest > row.updatedAt ? newest : row.updatedAt,
      undefined,
    );

    entries.push({
      url: `${SITE_URL}${library.path}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    for (const row of library.rows) {
      entries.push({
        url: `${SITE_URL}${library.path}/${row.slug}`,
        lastModified: row.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}