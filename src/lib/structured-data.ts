import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export interface Breadcrumb {
  name: string;
  path: string;
}

interface ResourceInput {
  name: string;
  description: string;
  path: string;
  updatedAt: string;
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
  };
}

export function breadcrumbJsonLd(crumbs: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function learningResourceJsonLd({
  name,
  description,
  path,
  updatedAt,
  learningResourceType,
}: ResourceInput & { learningResourceType: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name,
    description,
    url: `${SITE_URL}${path}`,
    inLanguage: "en",
    learningResourceType,
    teaches: "Spoken English",
    dateModified: updatedAt,
  };
}

/** A dictionary entry, so the word belongs to the vocabulary library's term set. */
export function definedTermJsonLd({
  name,
  description,
  path,
  updatedAt,
}: ResourceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name,
    description,
    url: `${SITE_URL}${path}`,
    inLanguage: "en",
    dateModified: updatedAt,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Vocabulary",
      url: `${SITE_URL}/vocabulary`,
    },
  };
}