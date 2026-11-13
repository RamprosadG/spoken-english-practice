export const SITE_NAME = "Spoken English Practice";

/** Absolute origin for the sitemap, robots and canonical URLs, no trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

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