export interface SitemapRow {
  id: string;
  updatedAt: Date;
}

export interface SitemapLibrary {
  path: string;
  rows: SitemapRow[];
}