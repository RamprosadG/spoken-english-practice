export interface SitemapRow {
  slug: string;
  updatedAt: Date;
}

export interface SitemapLibrary {
  path: string;
  rows: SitemapRow[];
}