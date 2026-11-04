import type { CategoryKind } from "@/lib/categories";

export type { CategoryKind };

export interface CategoryRow {
  id: string;
  name: string;
  sequence: number;
  usageCount: number;
}

export interface CategoryOption {
  id: string;
  name: string;
}
