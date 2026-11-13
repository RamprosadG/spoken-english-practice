import type { Metadata } from "next";

export const SITE_NAME = "Spoken English Practice";

export const SITE_DESCRIPTION =
  "Learn spoken English with daily presentations, common sentences, vocabulary with Bengali meanings, two-speaker conversations and dictation practice — each with audio and IPA pronunciation.";

/** Absolute origin for the sitemap, robots and canonical URLs, no trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** One share card for the whole site, at the 1.91:1 ratio the large card crops to. */
export const SITE_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1792,
  height: 1024,
  alt: SITE_NAME,
};

const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 155;

function truncate(text: string, maxLength: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();

  if (collapsed.length <= maxLength) {
    return collapsed;
  }

  const cut = collapsed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function metaTitle(text: string): string {
  return truncate(text, TITLE_MAX_LENGTH);
}

export function metaDescription(text: string): string {
  return truncate(text, DESCRIPTION_MAX_LENGTH);
}

/**
 * `resolveOpenGraph` reads `openGraph.title` only — it never falls back to the
 * page title — so a page that sets just `title` and `description` shares the
 * root's card. Every public page builds its metadata here instead.
 *
 * `path` is site-relative and resolves against the root `metadataBase`, which
 * also collapses `?search=` and `?page=` variants onto one canonical URL.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_OG_IMAGE.url],
    },
  };
}
