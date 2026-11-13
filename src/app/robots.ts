import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Crawl guidance only — the private pages already answer a real 404 and the API
 * already enforces its own role checks, so nothing here is a security boundary.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/question",
        "/learner",
        "/admin-register",
        "/practice",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}