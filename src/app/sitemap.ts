import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getSitemapLibraries } from "@/server/services/sitemap.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const libraries = await getSitemapLibraries();

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
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
        url: `${SITE_URL}${library.path}/${row.id}`,
        lastModified: row.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}