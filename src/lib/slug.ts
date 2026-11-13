const SLUG_MAX_LENGTH = 80;

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}

export async function resolveSlug(
  text: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  // Non-Latin-only titles still need a nonempty public address.
  const base = slugify(text) || "entry";

  let slug = base;
  for (let suffix = 2; await isTaken(slug); suffix += 1) {
    slug = `${base}-${suffix}`;
  }

  return slug;
}